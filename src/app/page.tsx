"use client";

import * as React from "react";
import type { Task, TaskHistory } from "@/lib/types";
import { tasks as initialTasks, taskHistories as initialTaskHistories } from "@/lib/mock-data";
import { AppHeader } from "@/components/app-header";
import { TaskTable } from "@/components/task-table";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [taskHistories, setTaskHistories] = React.useState<TaskHistory[]>(initialTaskHistories);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  const handleOpenForm = (task?: Task) => {
    setSelectedTask(task || null);
    setIsFormOpen(true);
  };

  const handleOpenHistory = (task: Task) => {
    setSelectedTask(task);
    setIsHistoryOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setTaskHistories(taskHistories.filter((hist) => hist.taskId !== taskId));
  };

  const handleUpdateTask = (taskId: string, updatedFields: Partial<Omit<Task, "id" | "createdAt">>) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return;

    const updatedTask = { ...originalTask, ...updatedFields };

    let changeDescription = '';
    if (updatedFields.taskName && updatedFields.taskName !== originalTask.taskName) {
        changeDescription = `Task name changed from "${originalTask.taskName}" to "${updatedTask.taskName}".`;
    } else if (updatedFields.PIC && updatedFields.PIC !== originalTask.PIC) {
        changeDescription = `PIC changed from "${originalTask.PIC}" to "${updatedTask.PIC}".`;
    } else {
        // Fallback for other potential inline edits, though currently only name and PIC are supported
        changeDescription = 'Task details updated.';
    }

    const newHistory: TaskHistory = {
        id: `hist-${Date.now()}`,
        taskId: taskId,
        changedAt: new Date(),
        PIC: updatedTask.PIC, 
        changeDescription,
    };
    
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    setTaskHistories([...taskHistories, newHistory]);
};


  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt">, taskId?: string) => {
    if (taskId) {
      // Update existing task
      const originalTask = tasks.find(t => t.id === taskId);
      if (!originalTask) return;

      const newHistory: TaskHistory[] = [];
      const updatedTask = {
        ...originalTask,
        ...taskData,
      };

      if (originalTask.status !== updatedTask.status) {
        newHistory.push({
          id: `hist-${Date.now()}-1`,
          taskId,
          changedAt: new Date(),
          PIC: updatedTask.PIC,
          changeDescription: `Status changed from "${originalTask.status}" to "${updatedTask.status}".`,
        });
      }
      if (originalTask.progress !== updatedTask.progress) {
        newHistory.push({
          id: `hist-${Date.now()}-2`,
          taskId,
          changedAt: new Date(),
          PIC: updatedTask.PIC,
          changeDescription: "Progress note updated.",
        });
      }

      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      if (newHistory.length > 0) {
        setTaskHistories([...taskHistories, ...newHistory]);
      }
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        ...taskData,
      };
      const newHistory: TaskHistory = {
        id: `hist-${Date.now()}`,
        taskId: newTask.id,
        changedAt: new Date(),
        PIC: newTask.PIC,
        changeDescription: "Task created.",
      };
      setTasks([newTask, ...tasks]);
      setTaskHistories([...taskHistories, newHistory]);
    }
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  const taskHistoryForSelectedTask = taskHistories
    .filter((h) => h.taskId === selectedTask?.id)
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

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
        taskHistories={selectedTask ? taskHistoryForSelectedTask : []}
      />
      
      <TaskHistoryDialog
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        task={selectedTask}
        history={taskHistoryForSelectedTask}
      />
    </div>
  );
}
