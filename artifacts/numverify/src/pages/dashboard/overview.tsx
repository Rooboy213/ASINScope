import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, TrendingUp, Package, Users } from "lucide-react";
import { useGetDashboardStats, useListDashboardProjects, useListDashboardOrders } from "@workspace/api-client-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for the chart since the API doesn't provide time-series data yet
const revenueData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 5000 },
  { month: 'Mar', value: 4800 },
  { month: 'Apr', value: 6000 },
  { month: 'May', value: 7200 },
  { month: 'Jun', value: 8500 },
  { month: 'Jul', value: 10000 },
];

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useListDashboardProjects();
  const { data: orders, isLoading: ordersLoading } = useListDashboardOrders();

  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your Amazon account.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">Download Report</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/projects">View Projects</Link>
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
            title="Total Spend" 
            value={formatCurrency(stats.totalSpend)} 
            icon={DollarSign}
            trend="+12%"
            trendUp={true}
          />
          <StatCard 
            title="Revenue Growth" 
            value={`${stats.revenueGrowth}%`} 
            icon={TrendingUp}
            trend="+4.5%"
            trendUp={true}
          />
          <StatCard 
            title="Keyword Rankings" 
            value={stats.keywordRankings.toLocaleString()} 
            icon={Activity}
            trend="+156"
            trendUp={true}
            trendLabel="new top 10s"
          />
          <StatCard 
            title="Active Projects" 
            value={stats.activeProjects.toString()} 
            icon={Package}
            trend="2"
            trendUp={true}
            trendLabel="pending review"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>Projected Amazon revenue based on current velocity.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  formatter={(value: number) => [`$${value}`, "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Currently in progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/dashboard/projects">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {projectsLoading ? (
              <div className="space-y-4 mt-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : activeProjects.length > 0 ? (
              <div className="space-y-6 mt-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate pr-2">{project.title}</span>
                      <span className="text-muted-foreground shrink-0">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{project.serviceType}</span>
                      <span>Due {formatDate(project.dueDate || project.startDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No active projects found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest service requests and renewals</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/dashboard/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4 mt-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Order ID</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Service</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{order.orderNumber}</td>
                        <td className="p-4">{order.serviceName}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                        <td className="p-4 text-right font-medium">{formatCurrency(order.amount, order.currency)}</td>
                        <td className="p-4 text-right">
                          <Badge 
                            variant="outline" 
                            className={
                              order.status === 'completed' ? "bg-accent/10 text-accent border-accent/20" :
                              order.status === 'in_progress' ? "bg-primary/10 text-primary border-primary/20" :
                              "bg-muted text-muted-foreground"
                            }
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border rounded-md border-dashed mt-4">
              <DollarSign className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-4">No recent orders found.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
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
  trendLabel = "from last month" 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  trend: string; 
  trendUp: boolean;
  trendLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold font-display">{value}</h3>
          <div className="flex items-center text-xs">
            <span className={cn("font-medium flex items-center", trendUp ? "text-accent" : "text-destructive")}>
              {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {trend}
            </span>
            <span className="text-muted-foreground ml-1">{trendLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
