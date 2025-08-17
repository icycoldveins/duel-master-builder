import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const form = useForm({
    defaultValues: { email: "", password: "" },
  });

  // Close modal if user becomes authenticated
  if (user && open) {
    onOpenChange(false);
    onSuccess?.();
  }

  const onSubmit = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("user already registered")) {
          toast({
            title: "Email already registered",
            description: "Please log in or use a different email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        setSubmitting(false);
        return;
      }
      toast({
        title: "Check your email",
        description:
          "A confirmation link has been sent. Please check your email to complete registration.",
      });
      onOpenChange(false);
      onSuccess?.();
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      toast({ title: "Welcome back!", description: "You are now logged in." });
      onOpenChange(false);
      onSuccess?.();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Login to Continue" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Login to save and load your decks"
              : "Create an account to save and load your decks"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? mode === "login"
                  ? "Logging in..."
                  : "Signing up..."
                : mode === "login"
                  ? "Login"
                  : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          {mode === "login" ? (
            <span className="text-sm">
              Don't have an account?{" "}
              <button
                className="text-primary hover:underline"
                onClick={() => setMode("signup")}
                disabled={submitting}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span className="text-sm">
              Already have an account?{" "}
              <button
                className="text-primary hover:underline"
                onClick={() => setMode("login")}
                disabled={submitting}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
