"use client";

import { formatDistanceToNow } from "date-fns";
import type { Task } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskActions } from "@/components/task-actions";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewHistory: (task: Task) => void;
}

export function TaskTable({
  tasks,
  onEditTask,
  onDeleteTask,
  onViewHistory,
}: TaskTableProps) {
  const getStatusBadgeVariant = (status: Task["status"]) => {
    switch (status) {
      case "Done":
        return "default";
      case "On-going":
        return "secondary";
      case "Hold":
        return "outline";
      default:
        return "default";
    }
  };

  if (tasks.length === 0) {
    return (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="flex flex-col items-center gap-2">
                <h2 className="font-headline text-2xl font-semibold">No tasks found</h2>
                <p className="text-muted-foreground">Click "New Task" to get started.</p>
            </div>
        </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Task Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <button onClick={() => onViewHistory(task)} className="text-left hover:underline">
                    {task.taskName}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>{task.PIC}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {task.progress || "-"}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <TaskActions
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onViewHistory={onViewHistory}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>
                <button onClick={() => onViewHistory(task)} className="text-left hover:underline">
                  {task.taskName}
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIC</span>
                <span>{task.PIC}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Progress</span>
                <p className="mt-1">{task.progress || "-"}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <TaskActions
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onViewHistory={onViewHistory}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
