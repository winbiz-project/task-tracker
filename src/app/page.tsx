
"use client";

import * as React from "react";
import type { Task, TaskHistory } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { TaskTable } from "@/components/task-table";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser, updateProfile, updatePassword } from "firebase/auth";
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
  setDoc,
  getDoc,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth-dialog";
import { UserProfileDialog } from "@/components/user-profile-dialog";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [taskHistories, setTaskHistories] = React.useState<TaskHistory[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const auth = getAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
        }
        setIsAuthDialogOpen(false);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);
  

  React.useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    };
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
      
      const historyQuery = query(collection(db, "taskHistories"), where("taskId", "==", taskId));
      const historySnapshot = await getDocs(historyQuery);
      
      historySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      const taskRef = doc(db, "tasks", taskId);
      batch.delete(taskRef);
      
      await batch.commit();
    } catch (error) {
      console.error("Error deleting task and its history: ", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete the task. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Omit<Task, "id" | "userId">>) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask || !user) return;

    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updatedFields);

    let changeDescription = '';
    const fieldMapping: Record<string, string> = {
        taskName: "Task name",
        PIC: "PIC",
        status: "Status",
        progress: "Progress note"
    };

    const changedField = Object.keys(updatedFields)[0] as keyof typeof updatedFields;
    const oldValue = originalTask[changedField as keyof Task];
    const newValue = updatedFields[changedField as keyof Omit<Task, "id" | "userId">];

    if (oldValue !== newValue) {
        if (changedField === 'progress') {
            changeDescription = 'Progress note updated.';
        } else {
             changeDescription = `${fieldMapping[changedField]} changed from "${oldValue}" to "${newValue}".`;
        }
    } else {
        return; 
    }

    const historyData: Omit<TaskHistory, "id" | "changedAt"> & { changedAt: any } = {
        taskId: taskId,
        changedAt: serverTimestamp(),
        PIC: user?.displayName || user?.email || "System", 
        changeDescription,
    };
    
    await addDoc(collection(db, "taskHistories"), historyData);
  };

  const handleSaveTask = async (taskData: Omit<Task, "id" | "userId">, taskId?: string) => {
    if (!user) return;
    try {
        if (taskId) {
            const originalTask = tasks.find(t => t.id === taskId);
            if (!originalTask) return;
            const batch = writeBatch(db);
            const taskRef = doc(db, "tasks", taskId);
            batch.update(taskRef, taskData);
            const updatedTask = { ...originalTask, ...taskData };
            const changes = [];
            if (originalTask.taskName !== updatedTask.taskName) changes.push(`Task name changed from "${originalTask.taskName}" to "${updatedTask.taskName}".`);
            if (originalTask.PIC !== updatedTask.PIC) changes.push(`PIC changed from "${originalTask.PIC}" to "${updatedTask.PIC}".`);
            if (originalTask.description !== updatedTask.description) changes.push(`Description updated.`);
            if (originalTask.status !== updatedTask.status) changes.push(`Status changed from "${originalTask.status}" to "${updatedTask.status}".`);
            if (originalTask.progress !== updatedTask.progress) changes.push(`Progress note updated.`);
            if ((originalTask.createdAt as Date).getTime() !== (updatedTask.createdAt as Date).getTime()) changes.push(`Date changed.`);

            if (changes.length > 0) {
                const historyRef = doc(collection(db, "taskHistories"));
                batch.set(historyRef, {
                    taskId,
                    changedAt: serverTimestamp(),
                    PIC: user?.displayName || user?.email || "System",
                    changeDescription: "Task details updated.",
                    changeDetail: changes.join('\n'),
                });
            }
            await batch.commit();
        } else {
            const docRef = await addDoc(collection(db, "tasks"), {
                ...taskData,
                userId: user.uid,
            });
            await addDoc(collection(db, "taskHistories"), {
                taskId: docRef.id,
                changedAt: serverTimestamp(),
                PIC: user?.displayName || user?.email || "System",
                changeDescription: "Task created.",
            });
        }
        setIsFormOpen(false);
        setSelectedTask(null);
    } catch (error) {
        console.error("Error saving task: ", error);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const handleUpdateUser = async (updatedData: { displayName: string }) => {
    if (!user) return;
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: updatedData.displayName });

      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { displayName: updatedData.displayName });

      // Force a refresh of the user object to get the latest data
      await auth.currentUser?.reload();
      setUser(auth.currentUser);

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
      setIsProfileDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your profile.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
    if (!user) return;
    try {
      await updatePassword(user, newPassword);
      toast({
        title: "Success",
        description: "Your password has been changed.",
      });
      setIsChangePasswordOpen(false);
    } catch (error: any) {
      console.error("Error updating password:", error);
      let description = "Could not update your password. Please try again.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This operation is sensitive. Please log out and log back in before changing your password.";
      }
      toast({
        title: "Update Failed",
        description,
        variant: "destructive",
      });
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
      <AppHeader 
        isLoggedIn={!!user}
        onNewTaskClick={() => handleOpenForm()} 
        onSignOut={handleSignOut} 
        onLoginClick={() => setIsAuthDialogOpen(true)}
        onEditProfileClick={() => setIsProfileDialogOpen(true)}
        userName={user?.displayName}
        userEmail={user?.email} 
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
        {user ? (
            <TaskTable
              tasks={tasks}
              onEditTask={handleOpenForm}
              onDeleteTask={handleDeleteTask}
              onViewHistory={handleOpenHistory}
              onUpdateTask={handleUpdateTask}
            />
          ) : (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                  <h2 className="font-headline text-3xl font-semibold">Welcome to TaskTrack</h2>
                  <p className="max-w-md text-muted-foreground">The simple and powerful to-do list tracker. Please log in or register to manage your tasks.</p>
                  <Button size="lg" onClick={() => setIsAuthDialogOpen(true)}>Login / Register</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <TaskFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        taskHistories={taskHistories}
        currentUserPIC={user?.displayName || user?.email}
      />
      
      <TaskHistoryDialog
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        task={selectedTask}
        history={taskHistories}
      />

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
      />

      <UserProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        user={user}
        onSave={handleUpdateUser}
        onChangePasswordClick={() => {
          setIsProfileDialogOpen(false);
          setIsChangePasswordOpen(true);
        }}
      />
      
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        onSave={handleUpdatePassword}
      />
    </div>
  );
}
