import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, Users, Package, FileText, Briefcase, Activity } from "lucide-react";
import { useGetAdminStats, useListAdminClients, useListAdminOrders, useListAdminTickets } from "@workspace/api-client-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for the chart
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 59000 },
  { month: 'Jun', revenue: 75000 },
  { month: 'Jul', revenue: 86000 },
];

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: clients, isLoading: clientsLoading } = useListAdminClients();
  const { data: tickets, isLoading: ticketsLoading } = useListAdminTickets();

  const recentClients = clients?.slice(0, 5) || [];
  const recentTickets = tickets?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Agency performance and client overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/reports">Generate Report</Link>
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link href="/admin/clients">View All Clients</Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={DollarSign}
            trend={`+${formatCurrency(stats.revenueThisMonth)}`}
            trendUp={true}
            trendLabel="this month"
          />
          <StatCard 
            title="Active Clients" 
            value={stats.totalClients.toString()} 
            icon={Users}
            trend={`+${stats.newClientsThisMonth}`}
            trendUp={true}
            trendLabel="new this month"
          />
          <StatCard 
            title="Active Projects" 
            value={stats.activeProjects.toString()} 
            icon={Briefcase}
            trend={`${stats.avgProjectCompletion}%`}
            trendUp={true}
            trendLabel="avg completion"
            trendColor="text-indigo-500"
          />
          <StatCard 
            title="Open Tickets" 
            value={stats.openTickets.toString()} 
            icon={Activity}
            trend="-2"
            trendUp={true}
            trendLabel="from yesterday"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Revenue History</CardTitle>
            <CardDescription>Monthly revenue across all client accounts.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `$${val/1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  formatter={(value: number) => [`$${value}`, "Revenue"]}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/admin/tickets">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {ticketsLoading ? (
              <div className="space-y-4 mt-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTickets.length > 0 ? (
              <div className="space-y-6 mt-4">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium truncate pr-2">{ticket.subject}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground truncate">{ticket.clientName || 'Unknown Client'}</p>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] px-1 py-0 h-4 border-transparent", 
                            ticket.priority === 'urgent' || ticket.priority === 'high' ? "bg-red-500/10 text-red-500" :
                            "bg-orange-500/10 text-orange-500"
                          )}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No open tickets.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Newly onboarded accounts</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/admin/clients">Manage Clients</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="space-y-4 mt-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentClients.length > 0 ? (
            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Company</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Email</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClients.map((client) => (
                      <tr key={client.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={client.avatarUrl || ""} alt={client.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {client.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {client.name}
                        </td>
                        <td className="p-4">{client.company || '-'}</td>
                        <td className="p-4 text-muted-foreground">{client.email}</td>
                        <td className="p-4 text-right text-muted-foreground">{formatDate(client.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border rounded-md border-dashed mt-4">
              <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-4">No recent clients found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  trendLabel = "from last month",
  trendColor = "text-accent"
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  trend: string; 
  trendUp: boolean;
  trendLabel?: string;
  trendColor?: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-indigo-500" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold font-display">{value}</h3>
          <div className="flex items-center text-xs">
            <span className={cn("font-medium flex items-center", trendUp ? trendColor : "text-destructive")}>
              {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowUpRight className="h-3 w-3 mr-0.5 rotate-90" />}
              {trend}
            </span>
            <span className="text-muted-foreground ml-1">{trendLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
