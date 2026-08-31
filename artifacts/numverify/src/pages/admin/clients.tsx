import React from "react";
import { Users } from "lucide-react";
import { useListAdminClients } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export default function AdminClients() {
  const { data: clients, isLoading } = useListAdminClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage all client accounts and access levels.</p>
        </div>
        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-sm px-3 py-1">
          {clients?.length ?? 0} total
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>All registered client accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : clients && clients.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">Company</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden lg:table-cell">Email</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Role</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                                {client.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{client.company || '—'}</td>
                        <td className="p-4 text-muted-foreground hidden lg:table-cell">{client.email}</td>
                        <td className="p-4 text-right">
                          <Badge variant="outline" className={
                            client.role === 'admin'
                              ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                              : "bg-muted text-muted-foreground"
                          }>
                            {client.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-muted-foreground hidden md:table-cell">{formatDate(client.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <Users className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No clients registered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
