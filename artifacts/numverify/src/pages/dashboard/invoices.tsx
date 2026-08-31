import React from "react";
import { FileText, Download } from "lucide-react";
import { useListDashboardInvoices } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; class: string }> = {
  paid:     { label: "Paid",     class: "bg-accent/10 text-accent border-accent/20" },
  sent:     { label: "Sent",     class: "bg-primary/10 text-primary border-primary/20" },
  overdue:  { label: "Overdue",  class: "bg-destructive/10 text-destructive border-destructive/20" },
  draft:    { label: "Draft",    class: "bg-muted text-muted-foreground border-border" },
};

export default function DashboardInvoices() {
  const { data: invoices, isLoading } = useListDashboardInvoices();

  const paidTotal = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0) ?? 0;
  const outstanding = invoices?.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-1">Manage and download your billing history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Paid</p>
            <h3 className="text-2xl font-bold text-accent">{formatCurrency(paidTotal)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding</p>
            <h3 className="text-2xl font-bold text-primary">{formatCurrency(outstanding)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All invoices issued by NumVerify for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : invoices && invoices.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Invoice #</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Service</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">Due Date</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="h-10 px-4 text-center font-medium text-muted-foreground">Status</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const sc = statusConfig[inv.status] ?? statusConfig.draft;
                      return (
                        <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-mono text-xs font-medium text-primary">{inv.invoiceNumber}</td>
                          <td className="p-4 font-medium">{inv.serviceName}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                          <td className="p-4 text-right font-semibold">{formatCurrency(inv.amount, inv.currency)}</td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className={cn("text-xs", sc.class)}>{sc.label}</Badge>
                          </td>
                          <td className="p-4 text-right">
                            {inv.pdfUrl ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">—</span>
                            )}
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
              <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No invoices found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
