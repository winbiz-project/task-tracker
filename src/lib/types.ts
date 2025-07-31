import type { Timestamp } from "firebase/firestore";

export type TaskStatus = "On-going" | "Hold" | "Done";

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface Task {
  id: string;
  userId: string;
  taskName: string;
  PIC: string;
  description?: string;
  progress?: string;
  status: TaskStatus;
  createdAt: Date | Timestamp;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  changedAt: Date | Timestamp;
  PIC: string;
  changeField: string;
  changeDescription: string;
  changeDetail?: string;
}
