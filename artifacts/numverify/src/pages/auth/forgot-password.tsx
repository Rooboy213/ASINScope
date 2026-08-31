import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MailCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForgotPassword } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const forgotMutation = useForgotPassword();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof forgotSchema>) {
    forgotMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "There was a problem sending the reset link. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-display font-bold text-2xl">N</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you a link to reset it.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-xl">
            <CardContent className="pt-6">
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Check your email</h3>
                  <p className="text-muted-foreground mb-6">
                    We've sent a password reset link to <br/>
                    <span className="font-medium text-foreground">{form.getValues().email}</span>
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="you@company.com" 
                              type="email" 
                              autoComplete="email" 
                              className="bg-background/50 h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 mt-6 text-base font-semibold" 
                      disabled={forgotMutation.isPending}
                    >
                      {forgotMutation.isPending ? "Sending link..." : "Send Reset Link"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            {!isSubmitted && (
              <CardFooter className="flex justify-center border-t py-4 bg-muted/10">
                <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
