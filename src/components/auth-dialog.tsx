
"use client";

import * as React from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AuthDialog({ isOpen, onOpenChange }: AuthDialogProps) {
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleAuth = async (action: "login" | "register") => {
    setIsLoading(true);
    try {
      if (action === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!displayName.trim()) {
            toast({
                title: "Registration Failed",
                description: "Please enter your name.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }
      }
      onOpenChange(false); // Close dialog on success
    } catch (error: any) {
      console.error(`${action} error:`, error);
      toast({
        title: `${action === "login" ? "Sign In" : "Registration"} Failed`,
        description: error.message || `Could not ${action}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onOpenChange(false); // Close dialog on success
    } catch (error: any) {
      console.error("Google Authentication error:", error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      setDisplayName("");
      setEmail("");
      setPassword("");
    }
  }, [isOpen]);

  const renderForm = (action: "login" | "register") => (
    <form onSubmit={(e) => { e.preventDefault(); handleAuth(action); }}>
      <div className="grid gap-4">
        {action === "register" && (
            <div className="grid gap-2">
                <Label htmlFor="register-name">Name</Label>
                <Input
                    id="register-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isLoading}
                />
            </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor={`${action}-email`}>Email</Label>
          <Input
            id={`${action}-email`}
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${action}-password`}>Password</Label>
          <Input
            id={`${action}-password`}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {action === "login" ? "Sign In" : "Create Account"}
        </Button>
      </div>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            {renderForm("login")}
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            {renderForm("register")}
          </TabsContent>
        </Tabs>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.4 512 244 512 111.3 512 0 398.5 0 256S111.3 0 244 0c69.3 0 125.3 23.4 172.4 68.6l-67.9 67.9C293.7 113.2 271.5 99.8 244 99.8c-66.8 0-121.5 54.9-121.5 122.3s54.6 122.3 121.5 122.3c71.3 0 99.4-48.4 102.8-72.2H244v-82.1h235.5c4.8 26.3 7.5 54.3 7.5 84.1z"></path>
                </svg>
            )}
            Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
