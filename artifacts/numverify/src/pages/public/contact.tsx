import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Mail, Phone, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      budget: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitContact.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          toast({
            title: "Message sent successfully!",
            description: "One of our Amazon growth specialists will reach out shortly.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "There was a problem sending your message. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-20 pb-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Let's Talk <span className="text-primary">Growth</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Ready to scale your brand on Amazon? Reach out and we'll get back to you within 24 hours.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll connect you with the right specialist.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 bg-muted/20 rounded-lg border border-dashed">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <Send className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Received</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We've received your request and will be in touch shortly.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline">
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Work Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555) 000-0000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service of Interest</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="amazon-seo">Amazon SEO & Ranking</SelectItem>
                                  <SelectItem value="ppc-management">PPC Management</SelectItem>
                                  <SelectItem value="listing-optimization">Listing Optimization</SelectItem>
                                  <SelectItem value="full-management">Full Account Management</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your brand, current challenges, and goals..." 
                                  className="min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full h-12 text-lg" 
                          disabled={submitContact.isPending}
                        >
                          {submitContact.isPending ? "Sending..." : "Submit Request"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold mb-6 font-display">Get in touch directly</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mr-4">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Email Us</h4>
                      <p className="text-muted-foreground mb-2">Our friendly team is here to help.</p>
                      <a href="mailto:hello@numverify.agency" className="text-primary hover:underline font-medium">hello@numverify.agency</a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mr-4">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Visit Us</h4>
                      <p className="text-muted-foreground mb-2">Come say hello at our office HQ.</p>
                      <address className="not-italic text-foreground">
                        100 Innovation Drive<br />
                        Suite 400<br />
                        San Francisco, CA 94103
                      </address>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mr-4">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Call Us</h4>
                      <p className="text-muted-foreground mb-2">Mon-Fri from 8am to 5pm.</p>
                      <a href="tel:+15550000000" className="text-primary hover:underline font-medium">+1 (555) 000-0000</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border/50">
                <h3 className="text-xl font-bold mb-4 font-display">Instant Messaging</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" /> WhatsApp
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Send className="h-4 w-4 text-blue-400" /> Telegram
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
