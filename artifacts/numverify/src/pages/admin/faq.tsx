import React from "react";
import { HelpCircle, Pencil, Trash2, Plus } from "lucide-react";
import { useListFaq, useDeleteFaqItem } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminFaq() {
  const { data: faqs, isLoading, refetch } = useListFaq();
  const deleteFaq = useDeleteFaqItem();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteFaq.mutate({ id }, {
      onSuccess: () => { toast({ title: "FAQ item deleted" }); refetch(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const categories = faqs ? Array.from(new Set(faqs.map(f => f.category))) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(cat => (
          <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>{faqs?.length ?? 0} FAQ items.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : faqs && faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map(faq => (
                <div key={faq.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{faq.question}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{faq.answer}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                      <span className="text-xs text-muted-foreground">Order: {faq.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete FAQ item?</AlertDialogTitle>
                          <AlertDialogDescription>Remove this question from the FAQ?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(faq.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <HelpCircle className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No FAQ items yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
