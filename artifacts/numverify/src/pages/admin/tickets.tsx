import React from "react";
import { LifeBuoy } from "lucide-react";
import { useListAdminTickets } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; class: string }> = {
  open:        { label: "Open",        class: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "In Progress", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  waiting:     { label: "Waiting",     class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  resolved:    { label: "Resolved",    class: "bg-accent/10 text-accent border-accent/20" },
  closed:      { label: "Closed",      class: "bg-muted text-muted-foreground border-border" },
};

const priorityClass: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-destructive font-semibold",
};

export default function AdminTickets() {
  const { data: tickets, isLoading } = useListAdminTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to all client support requests.</p>
        </div>
        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-sm px-3 py-1">
          {tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length ?? 0} open
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>Support requests from all clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map(ticket => {
                const sc = statusConfig[ticket.status] ?? statusConfig.open;
                return (
                  <div key={ticket.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{ticket.lastMessage}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium">{ticket.clientName || `Client #${ticket.clientId}`}</span>
                        <span className="text-xs text-muted-foreground">{ticket.category}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="outline" className={cn("text-xs", sc.class)}>{sc.label}</Badge>
                      <span className={cn("text-xs", priorityClass[ticket.priority] ?? "text-muted-foreground")}>{ticket.priority}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <LifeBuoy className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No tickets found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
