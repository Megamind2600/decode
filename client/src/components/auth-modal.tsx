import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Gift, Unlock } from "lucide-react";
import Dashboard from "@/pages/dashboard";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  referralCode: z.string().length(6, "Referral code must be 6 characters").optional().or(z.literal("")),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().length(8, "Password must be 8 characters"),
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "register" | "login";
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"register" | "login">(mode);
  const { login } = useAuth();
  const { toast } = useToast();

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      referralCode: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: z.infer<typeof registerSchema>) => 
      authApi.register(data.email, data.referralCode || undefined),
    onSuccess: (response) => {
      login({
        ...response.user,
        questionsCompleted: 0,
        abGroup: "A",
      });
      toast({
        title: "Account Created!",
        description: `Your password is: ${response.password}. Save it securely!`,
      });
      onClose();
      window.location.href = "/dashboard";

    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: z.infer<typeof loginSchema>) => 
      authApi.login(data.email, data.password),
    onSuccess: (response) => {
      login({
        ...response.user,
        questionsCompleted: response.user.questionsCompleted || 0,
        abGroup: response.user.abGroup || "A",
      });
      toast({
        title: "Welcome back!",
        description: "You're now logged in.",
      });
      onClose();
      window.location.href = "/dashboard";

    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {authMode === "register" ? "Unlock More Questions" : "Welcome Back"}
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {authMode === "register" 
              ? "Get 10 more practice questions with your email" 
              : "Enter your credentials to continue"
            }
          </p>
        </DialogHeader>

        {authMode === "register" ? (
          <Form key="register" {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Code (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="AIX9K2"
                        maxLength={6}
                        data-testid="input-referral"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="bg-muted/50 border border-border">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center">
                    <Gift className="text-accent mr-2 h-4 w-4" />
                    What You'll Get:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 10 additional practice questions</li>
                    <li>• Detailed AI feedback and scoring</li>
                    <li>• Progress tracking and analytics</li>
                    <li>• Referral rewards program</li>
                  </ul>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                <Unlock className="mr-2 h-4 w-4" />
                Get My Questions
              </Button>
            </form>
          </Form>
        ) : (
          <Form key="login" {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="8-character password"
                        maxLength={8}
                        data-testid="input-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                Sign In
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center">
          <button 
            className="text-muted-foreground hover:text-foreground text-sm"
            onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
            data-testid="button-switch-auth"
          >
            {authMode === "register" 
              ? "Already have an account? Sign in" 
              : "Need an account? Register for free"
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
