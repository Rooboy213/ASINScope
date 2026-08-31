import React from "react";
import { MailOpen, Download } from "lucide-react";
import { useListNewsletterSubscribers } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export default function AdminSubscribers() {
  const { data: subscribers, isLoading } = useListNewsletterSubscribers();

  const downloadCsv = () => {
    if (!subscribers?.length) return;
    const rows = [["Email", "Name", "Subscribed At"], ...subscribers.map(s => [s.email, s.name ?? "", s.subscribedAt])];
    const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "numverify-subscribers.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Subscribers</h1>
          <p className="text-muted-foreground mt-1">Manage newsletter subscribers and export your audience.</p>
        </div>
        <Button variant="outline" onClick={downloadCsv} disabled={!subscribers?.length}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Newsletter Audience</CardTitle>
            <CardDescription>People who opted in to receive NumVerify insights.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            {subscribers?.length ?? 0} subscribers
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : subscribers && subscribers.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Email</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell">Name</th>
                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(subscriber => (
                    <tr key={subscriber.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-2"><MailOpen className="h-4 w-4 text-indigo-500" />{subscriber.email}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{subscriber.name || "—"}</td>
                      <td className="p-4 text-right text-muted-foreground">{formatDate(subscriber.subscribedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <MailOpen className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No subscribers yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}