"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut, LogIn } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppHeaderProps {
  isLoggedIn: boolean;
  onNewTaskClick: () => void;
  onSignOut: () => void;
  onLoginClick: () => void;
  userName?: string | null;
  userEmail?: string | null;
}

export function AppHeader({ isLoggedIn, onNewTaskClick, onSignOut, onLoginClick, userName, userEmail }: AppHeaderProps) {
  
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
            TaskTrack
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Button onClick={onNewTaskClick}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Task
              </Button>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="#" alt="User Avatar" />
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
          ) : (
            <Button onClick={onLoginClick}>
              <LogIn className="mr-2 h-4 w-4" />
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
