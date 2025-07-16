"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Task, TaskHistory } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { TaskTable } from "@/components/task-table";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [taskHistories, setTaskHistories] = React.useState<TaskHistory[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const auth = getAuth();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);
  

  // Fetch tasks in real-time
  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksData.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Task);
      });
      setTasks(tasksData);
    }, (error) => {
        console.error("Task listener error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch history for selected task in real-time
   React.useEffect(() => {
    if (!selectedTask?.id) {
        setTaskHistories([]);
        return;
    }

    const q = query(
        collection(db, "taskHistories"),
        where("taskId", "==", selectedTask.id),
        orderBy("changedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historiesData: TaskHistory[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            historiesData.push({
                id: doc.id,
                ...data,
                changedAt: (data.changedAt as Timestamp)?.toDate() || new Date(),
            } as TaskHistory);
        });
        setTaskHistories(historiesData);
    }, (error) => {
        console.error("History listener error:", error);
    });

    return () => unsubscribe();

}, [selectedTask]);


  const handleOpenForm = (task?: Task) => {
    setSelectedTask(task || null);
    setIsFormOpen(true);
  };

  const handleOpenHistory = (task: Task) => {
    setSelectedTask(task);
    setIsHistoryOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
        const batch = writeBatch(db);

        // Reference to the main task document
        const taskRef = doc(db, "tasks", taskId);

        // Find and delete all related history documents
        const historyQuery = query(collection(db, "taskHistories"), where("taskId", "==", taskId));
        const historySnapshot = await getDocs(historyQuery);
        
        historySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        // Delete the main task document
        batch.delete(taskRef);

        // Commit the batch
        await batch.commit();

    } catch (error) {
        console.error("Error deleting task and its history: ", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Omit<Task, "id" | "createdAt" | "userId">>) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask || !user) return;

    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updatedFields);
    
    // Create history entry
    const updatedTask = { ...originalTask, ...updatedFields };

    let changeDescription = '';
    let changeDetail: string | undefined = undefined;

    const fieldMapping: Record<string, string> = {
        taskName: "Task name",
        PIC: "PIC",
        status: "Status",
        progress: "Progress note"
    };

    const changedField = Object.keys(updatedFields)[0] as keyof typeof updatedFields;
    const oldValue = originalTask[changedField];
    const newValue = updatedFields[changedField];

    if (oldValue !== newValue) {
        if (changedField === 'progress') {
            changeDescription = 'Progress note updated.';
            changeDetail = newValue as string;
        } else {
             changeDescription = `${fieldMapping[changedField]} changed from "${oldValue}" to "${newValue}".`;
        }
    } else {
        return; // No actual change
    }

    await addDoc(collection(db, "taskHistories"), {
        taskId: taskId,
        changedAt: serverTimestamp(),
        PIC: user?.email || "System", 
        changeDescription,
        changeDetail,
    });
};


  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt" | "userId">, taskId?: string) => {
    if (!user) return; // Should not happen if page is protected

    try {
      if (taskId) {
        // Update existing task
        const originalTask = tasks.find(t => t.id === taskId);
        if (!originalTask) return;

        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, taskData);

        const updatedTask = { ...originalTask, ...taskData };

        if (originalTask.status !== updatedTask.status) {
          await addDoc(collection(db, "taskHistories"), {
              taskId,
              changedAt: serverTimestamp(),
              PIC: user?.email || "System",
              changeDescription: `Status changed from "${originalTask.status}" to "${updatedTask.status}".`,
          });
        }
        
        if (taskData.progress && originalTask.progress !== updatedTask.progress) {
          await addDoc(collection(db, "taskHistories"), {
              taskId,
              changedAt: serverTimestamp(),
              PIC: user?.email || "System",
              changeDescription: "Progress note updated.",
              changeDetail: updatedTask.progress,
          });
        }

      } else {
        // Create new task
        const docRef = await addDoc(collection(db, "tasks"), {
          ...taskData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        
        await addDoc(collection(db, "taskHistories"), {
          taskId: docRef.id,
          changedAt: serverTimestamp(),
          PIC: user?.email || "System",
          changeDescription: "Task created.",
        });
      }
      setIsFormOpen(false);
      setSelectedTask(null);
    } catch(error) {
        console.error("Error saving task: ", error);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col">
        <header className="sticky top-0 z-10 w-full border-b bg-card shadow-sm">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
           <div className="mx-auto max-w-7xl space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
           </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <AppHeader onNewTaskClick={() => handleOpenForm()} onSignOut={handleSignOut} userEmail={user?.email} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <TaskTable
            tasks={tasks}
            onEditTask={handleOpenForm}
            onDeleteTask={handleDeleteTask}
            onViewHistory={handleOpenHistory}
            onUpdateTask={handleUpdateTask}
          />
        </div>
      </main>

      <TaskFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        taskHistories={taskHistories}
      />
      
      <TaskHistoryDialog
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        task={selectedTask}
        history={taskHistories}
      />
    </div>
  );
}
