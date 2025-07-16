"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { generateTaskDescription } from "@/ai/flows/generate-task-description";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Task, TaskHistory, TaskStatus } from "@/lib/types";

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  PIC: z.string().min(1, "Person in charge is required"),
  description: z.string().optional(),
  progress: z.string().optional(),
  status: z.enum(["On-going", "Hold", "Done"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

const statusOptions: TaskStatus[] = ["On-going", "Hold", "Done"];

interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Task, "id" | "createdAt" | "userId">, taskId?: string) => void;
  task: Task | null;
  taskHistories: TaskHistory[];
}

export function TaskFormDialog({ isOpen, onOpenChange, onSave, task }: TaskFormDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: "",
      PIC: "",
      description: "",
      progress: "",
      status: "On-going",
    },
  });

  React.useEffect(() => {
    if (task) {
      form.reset(task);
    } else {
      form.reset({
        taskName: "",
        PIC: "",
        description: "",
        progress: "",
        status: "On-going",
      });
    }
  }, [task, form, isOpen]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    const taskName = form.getValues("taskName");
    if (!taskName) {
      toast({
        title: "Error",
        description: "Please enter a task name first.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateTaskDescription({ taskName });
      if (result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
            title: "Description generated!",
            description: "The AI has suggested a description for you."
        });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: TaskFormData) => {
    onSave(data, task?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{task ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your task." : "Fill in the details for a new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Deploy new feature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="PIC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person In Charge (PIC)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alice Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center justify-between">
                        <FormLabel>Description</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                            )}
                            Generate Description
                        </Button>
                    </div>
                  <FormControl>
                    <Textarea placeholder="Add a detailed description for the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a short progress note..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
