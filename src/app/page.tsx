"use client";

import * as React from "react";
import type { Task, TaskHistory } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { TaskTable } from "@/components/task-table";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";
import { db } from "@/lib/firebase";
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
} from "firebase/firestore";

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [taskHistories, setTaskHistories] = React.useState<TaskHistory[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  // Fetch tasks in real-time
  React.useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
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
    });
    return () => unsubscribe();
  }, []);

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
    try {
        // Note: This doesn't delete sub-collections (task history) in one go.
        // For production, a Cloud Function would be needed to clean up history.
        await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
        console.error("Error deleting task: ", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Omit<Task, "id" | "createdAt">>) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return;

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
        PIC: updatedTask.PIC, 
        changeDescription,
        changeDetail,
    });
};


  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt">, taskId?: string) => {
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
            PIC: updatedTask.PIC,
            changeDescription: `Status changed from "${originalTask.status}" to "${updatedTask.status}".`,
        });
      }
      
      if (taskData.progress && originalTask.progress !== updatedTask.progress) {
         await addDoc(collection(db, "taskHistories"), {
            taskId,
            changedAt: serverTimestamp(),
            PIC: updatedTask.PIC,
            changeDescription: "Progress note updated.",
            changeDetail: updatedTask.progress,
        });
      }

    } else {
      // Create new task
      const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        createdAt: serverTimestamp(),
      });
      
      await addDoc(collection(db, "taskHistories"), {
        taskId: docRef.id,
        changedAt: serverTimestamp(),
        PIC: taskData.PIC,
        changeDescription: "Task created.",
      });
    }
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <AppHeader onNewTaskClick={() => handleOpenForm()} />
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
