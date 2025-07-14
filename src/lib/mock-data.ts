import type { Task, TaskHistory } from "@/lib/types";

export const tasks: Task[] = [
  {
    id: "task-1",
    taskName: "Deploy new feature to production",
    PIC: "Alice Johnson",
    description: "Deploy the new user authentication feature to the production environment. Ensure all tests pass.",
    progress: "Deployment pipeline configured and staging tests are passing.",
    status: "On-going",
    createdAt: new Date("2023-10-26T10:00:00Z"),
  },
  {
    id: "task-2",
    taskName: "Design marketing campaign assets",
    PIC: "Bob Williams",
    description: "Create all visual assets for the upcoming Q4 marketing campaign, including social media graphics and ad banners.",
    progress: "Initial concepts are drafted. Awaiting feedback from the marketing team.",
    status: "On-going",
    createdAt: new Date("2023-10-25T14:30:00Z"),
  },
  {
    id: "task-3",
    taskName: "Fix critical bug #112-B",
    PIC: "Charlie Brown",
    progress: "The bug has been successfully patched and deployed. Monitoring for any side effects.",
    status: "Done",
    createdAt: new Date("2023-10-24T09:00:00Z"),
  },
  {
    id: "task-4",
    taskName: "Onboard new software engineer",
    PIC: "Alice Johnson",
    description: "Complete the onboarding process for the new hire, including setting up their development environment and introducing them to the team.",
    progress: "Awaiting hardware delivery.",
    status: "Hold",
    createdAt: new Date("2023-10-23T11:00:00Z"),
  },
  {
    id: "task-5",
    taskName: "Finalize Q4 financial report",
    PIC: "Diana Miller",
    progress: "Report is complete and has been sent for final review.",
    status: "Done",
    createdAt: new Date("2023-10-22T16:00:00Z"),
  },
];

export const taskHistories: TaskHistory[] = [
  // History for task-1
  {
    id: "hist-1-1",
    taskId: "task-1",
    changedAt: new Date("2023-10-26T10:00:00Z"),
    PIC: "Alice Johnson",
    changeDescription: "Task created.",
  },
  {
    id: "hist-1-2",
    taskId: "task-1",
    changedAt: new Date("2023-10-26T11:30:00Z"),
    PIC: "Alice Johnson",
    changeDescription: "Progress note updated.",
  },
  // History for task-2
  {
    id: "hist-2-1",
    taskId: "task-2",
    changedAt: new Date("2023-10-25T14:30:00Z"),
    PIC: "Bob Williams",
    changeDescription: "Task created.",
  },
  // History for task-3
  {
    id: "hist-3-1",
    taskId: "task-3",
    changedAt: new Date("2023-10-24T09:00:00Z"),
    PIC: "Charlie Brown",
    changeDescription: "Task created.",
  },
  {
    id: "hist-3-2",
    taskId: "task-3",
    changedAt: new Date("2023-10-24T15:00:00Z"),
    PIC: "Charlie Brown",
    changeDescription: 'Status changed from "On-going" to "Done".',
  },
  // History for task-4
  {
    id: "hist-4-1",
    taskId: "task-4",
    changedAt: new Date("2023-10-23T11:00:00Z"),
    PIC: "Alice Johnson",
    changeDescription: "Task created.",
  },
    {
    id: "hist-4-2",
    taskId: "task-4",
    changedAt: new Date("2023-10-23T12:00:00Z"),
    PIC: "Alice Johnson",
    changeDescription: 'Status changed from "On-going" to "Hold".',
  },
  // History for task-5
  {
    id: "hist-5-1",
    taskId: "task-5",
    changedAt: new Date("2023-10-22T16:00:00Z"),
    PIC: "Diana Miller",
    changeDescription: "Task created.",
  },
    {
    id: "hist-5-2",
    taskId: "task-5",
    changedAt: new Date("2023-10-22T18:00:00Z"),
    PIC: "Diana Miller",
    changeDescription: 'Status changed from "On-going" to "Done".',
  },
];
