export type TaskStatus = "On-going" | "Hold" | "Done";

export interface Task {
  id: string;
  taskName: string;
  PIC: string;
  description?: string;
  progress?: string;
  status: TaskStatus;
  createdAt: Date;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  changedAt: Date;
  PIC: string;
  changeDescription: string;
  changeDetail?: string;
}
