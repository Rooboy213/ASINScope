import React from "react";
import { Star, Trash2, Plus } from "lucide-react";
import { useListTestimonials, useDeleteTestimonial } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminTestimonials() {
  const { data: testimonials, isLoading, refetch } = useListTestimonials();
  const deleteTestimonial = useDeleteTestimonial();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteTestimonial.mutate({ id }, {
      onSuccess: () => { toast({ title: "Testimonial deleted" }); refetch(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage client reviews and success stories.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Testimonial</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>{testimonials?.length ?? 0} testimonials total.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map(t => (
                <div key={t.id} className="p-5 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                          {t.clientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{t.clientName}</p>
                        <p className="text-xs text-muted-foreground">{t.clientTitle} — {t.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {t.featured && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs mr-1">Featured</Badge>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
                            <AlertDialogDescription>Remove testimonial from {t.clientName}?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {Array(t.rating).fill(0).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 italic">"{t.text}"</p>
                  {t.metrics && (
                    <p className="text-xs font-medium text-primary mt-2">{t.metrics}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <Star className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No testimonials yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
