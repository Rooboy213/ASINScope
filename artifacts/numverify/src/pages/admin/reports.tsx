import React, { useState } from "react";
import { FileDown, Send } from "lucide-react";
import { useListAdminClients, useUploadReport } from "@workspace/api-client-react";
import type { ReportInput } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const emptyForm: ReportInput = {
  title: "", description: "", fileUrl: "", reportType: "Monthly Report", period: "", clientId: 0,
};

export default function AdminReports() {
  const { data: clients } = useListAdminClients();
  const uploadReport = useUploadReport();
  const { toast } = useToast();
  const [form, setForm] = useState<ReportInput>(emptyForm);

  const update = (key: keyof ReportInput, value: string | number) => setForm(current => ({ ...current, [key]: value }));
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.clientId) {
      toast({ title: "Choose a client", description: "Select a client before publishing the report.", variant: "destructive" });
      return;
    }
    uploadReport.mutate({ data: { ...form, fileUrl: form.fileUrl || undefined } }, {
      onSuccess: () => {
        toast({ title: "Report published", description: "The client can now access it from their dashboard." });
        setForm(emptyForm);
      },
      onError: () => toast({ title: "Could not publish report", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">Publish performance reports directly to a client dashboard.</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Publish a Report</CardTitle>
          <CardDescription>Attach a report link and make it available to a specific client.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Client</Label>
              <Select value={form.clientId ? String(form.clientId) : ""} onValueChange={value => update("clientId", Number(value))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients?.map(client => <SelectItem key={client.id} value={String(client.id)}>{client.name} · {client.company || client.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Report title</Label>
              <Input className="mt-1" value={form.title} onChange={e => update("title", e.target.value)} placeholder="July 2024 Monthly Performance Report" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Report type</Label>
                <Select value={form.reportType} onValueChange={value => update("reportType", value)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Monthly Report", "Quarterly Report", "PPC Report", "Competitor Analysis", "Custom Report"].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reporting period</Label>
                <Input className="mt-1" value={form.period} onChange={e => update("period", e.target.value)} placeholder="July 2024" required />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1 min-h-[110px]" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Summarize what this report covers..." required />
            </div>
            <div>
              <Label>Report URL</Label>
              <Input className="mt-1" type="url" value={form.fileUrl} onChange={e => update("fileUrl", e.target.value)} placeholder="https://..." />
            </div>
            <Button type="submit" disabled={uploadReport.isPending}>
              <Send className="h-4 w-4 mr-2" /> {uploadReport.isPending ? "Publishing..." : "Publish Report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}