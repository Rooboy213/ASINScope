import React, { useState } from "react";
import { LifeBuoy, Plus, X } from "lucide-react";
import { useListDashboardTickets, useCreateTicket } from "@workspace/api-client-react";
import type { TicketInputPriority } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; class: string }> = {
  open:        { label: "Open",        class: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "In Progress", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  waiting:     { label: "Waiting",     class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  resolved:    { label: "Resolved",    class: "bg-accent/10 text-accent border-accent/20" },
  closed:      { label: "Closed",      class: "bg-muted text-muted-foreground border-border" },
};

const priorityConfig: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-destructive font-semibold",
};

export default function DashboardTickets() {
  const { data: tickets, isLoading, refetch } = useListDashboardTickets();
  const createTicket = useCreateTicket();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ subject: string; category: string; priority: TicketInputPriority; message: string }>({ subject: "", category: "General", priority: "medium", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({ data: form }, {
      onSuccess: () => {
        toast({ title: "Ticket created", description: "We'll respond within 24 hours." });
        setOpen(false);
        setForm({ subject: "", category: "General", priority: "medium", message: "" });
        refetch();
      },
      onError: () => toast({ title: "Error", description: "Could not create ticket.", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Get help from our team on any issues or questions.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> New Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <CardDescription>Track the status of your support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map(ticket => {
                const sc = statusConfig[ticket.status] ?? statusConfig.open;
                return (
                  <div key={ticket.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        {ticket.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                            {ticket.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ticket.lastMessage}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{ticket.category}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="outline" className={cn("text-xs", sc.class)}>{sc.label}</Badge>
                      <span className={cn("text-xs", priorityConfig[ticket.priority] ?? "text-muted-foreground")}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <LifeBuoy className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground mb-4">No support tickets yet.</p>
              <Button variant="outline" onClick={() => setOpen(true)}>Open your first ticket</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Describe your issue and we'll get back to you within 24 hours.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input className="mt-1" placeholder="Brief description of your issue" value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["General", "SEO & Rankings", "PPC & Advertising", "Product Launch", "Billing", "Creative Services"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as TicketInputPriority }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea className="mt-1 min-h-[120px]" placeholder="Describe your issue in detail..." value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTicket.isPending}>
                {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
