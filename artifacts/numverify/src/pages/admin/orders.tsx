import React from "react";
import { ShoppingCart } from "lucide-react";
import { useListAdminOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; class: string }> = {
  completed:   { label: "Completed",   class: "bg-accent/10 text-accent border-accent/20" },
  in_progress: { label: "In Progress", class: "bg-primary/10 text-primary border-primary/20" },
  pending:     { label: "Pending",     class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  cancelled:   { label: "Cancelled",   class: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useListAdminOrders();

  const totalRevenue = orders?.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0) ?? 0;
  const pending = orders?.filter(o => o.status === 'pending' || o.status === 'in_progress').length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">All service orders across all client accounts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
          <h3 className="text-2xl font-bold">{orders?.length ?? 0}</h3>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Revenue (Completed)</p>
          <h3 className="text-2xl font-bold text-accent">{formatCurrency(totalRevenue)}</h3>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Active Orders</p>
          <h3 className="text-2xl font-bold text-primary">{pending}</h3>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Service orders from all client accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : orders && orders.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Order ID</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Service</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">Client</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">Date</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const sc = statusConfig[order.status] ?? statusConfig.pending;
                      return (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-mono text-xs font-medium text-indigo-500">{order.orderNumber}</td>
                          <td className="p-4 font-medium">{order.serviceName}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{order.clientName || `#${order.clientId}`}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{formatDate(order.createdAt)}</td>
                          <td className="p-4 text-right font-semibold">{formatCurrency(order.amount, order.currency)}</td>
                          <td className="p-4 text-right">
                            <Badge variant="outline" className={cn("text-xs", sc.class)}>{sc.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No orders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
