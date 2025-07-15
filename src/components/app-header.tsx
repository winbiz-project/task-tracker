"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Icons } from "@/components/icons";

interface AppHeaderProps {
  onNewTaskClick: () => void;
}

export function AppHeader({ onNewTaskClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
            DW TaskTrack
          </h1>
        </div>
        <Button onClick={onNewTaskClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>
    </header>
  );
}
