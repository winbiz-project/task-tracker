"use client";

import type { Task, TaskHistory } from "@/lib/types";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TaskHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task | null;
  history: TaskHistory[];
}

export function TaskHistoryDialog({
  isOpen,
  onOpenChange,
  task,
  history,
}: TaskHistoryDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">History for: {task.taskName}</DialogTitle>
          <DialogDescription>
            A log of all changes made to this task.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ScrollArea className="h-72">
          <div className="space-y-6 pr-4">
            {history.length > 0 ? (
              history.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    {index < history.length - 1 && (
                      <div className="h-full w-px bg-border"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{entry.changeDescription}</p>
                    {entry.changeDetail && (
                      <pre className="mt-2 border-l-2 pl-4 text-sm text-muted-foreground font-sans whitespace-pre-wrap">
                        {entry.changeDetail}
                      </pre>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      by {entry.PIC}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(entry.changedAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No history found for this task.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
