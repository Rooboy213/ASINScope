import React from "react";
import { Mail } from "lucide-react";
import { useListAdminContacts } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export default function AdminContacts() {
  const { data: contacts, isLoading } = useListAdminContacts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Contact Submissions</h1>
        <p className="text-muted-foreground mt-1">View all contact form submissions and inquiries.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>{contacts?.length ?? 0} total submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact: any) => (
                <div key={contact.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDate(contact.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{contact.email}{contact.company ? ` · ${contact.company}` : ''}</p>
                    {contact.service && (
                      <Badge variant="outline" className="text-xs mb-2">{contact.service}</Badge>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">{contact.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <Mail className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No contact submissions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
