
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { type User as FirebaseUser } from "firebase/auth";

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

const profileSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: FirebaseUser | null;
  onSave: (data: ProfileFormData) => Promise<void>;
}

export function UserProfileDialog({ isOpen, onOpenChange, user, onSave }: UserProfileDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
      });
    }
  }, [user, form, isOpen]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    await onSave(data);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your account details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid gap-2">
                <FormLabel>Email</FormLabel>
                <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
