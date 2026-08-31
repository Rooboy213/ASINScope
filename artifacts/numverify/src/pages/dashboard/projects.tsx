import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Calendar, User, Clock } from "lucide-react";
import { useListDashboardProjects } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; class: string }> = {
  active:    { label: "Active",    class: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Completed", class: "bg-accent/10 text-accent border-accent/20" },
  paused:    { label: "Paused",    class: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function DashboardProjects() {
  const { data: projects, isLoading } = useListDashboardProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-1">Track all your active and completed Amazon growth projects.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-2 w-full my-4" /><Skeleton className="h-4 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => {
            const sc = statusConfig[project.status] ?? statusConfig.active;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg leading-snug">{project.title}</CardTitle>
                      <Badge variant="outline" className={cn("shrink-0 text-xs", sc.class)}>
                        {sc.label}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-primary/70">
                      {project.serviceType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate">{project.managerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span>Started {formatDate(project.startDate)}</span>
                      </div>
                      {project.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          <span>Due {formatDate(project.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border rounded-xl border-dashed bg-muted/20">
          <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
          <p className="text-muted-foreground text-sm">Your growth projects will appear here once initiated.</p>
        </div>
      )}
    </div>
  );
}
