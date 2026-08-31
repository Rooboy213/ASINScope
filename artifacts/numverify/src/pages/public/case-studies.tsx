import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useListCaseStudies } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CaseStudiesPage() {
  const { data: caseStudies, isLoading } = useListCaseStudies();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-20 pb-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Real Results.<br/>
            <span className="text-primary">Real Revenue.</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Don't just take our word for it. See how we've helped ambitious brands dominate their categories on Amazon.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background flex-1">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-20 w-full rounded-md" />
                      <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {caseStudies?.map((study, i) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full flex flex-col group hover:border-primary/50 transition-colors bg-card overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                          {study.industry}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {study.timelineMonths} Month Timeline
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-display">{study.title}</CardTitle>
                      <CardDescription className="text-base mt-2 line-clamp-2">
                        {study.challenge}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {study.metrics.slice(0, 2).map((metric, j) => (
                          <div key={j} className="bg-muted/50 rounded-lg p-4 flex flex-col justify-center border border-border/50">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{metric.label}</span>
                            <div className="flex items-end gap-2">
                              <span className="text-2xl font-bold">{metric.after}</span>
                              <span className="flex items-center text-sm font-medium text-accent mb-1">
                                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                {metric.improvement}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t bg-muted/10">
                      <Button variant="ghost" className="w-full justify-between hover:bg-transparent hover:text-primary group-hover:text-primary transition-colors" asChild>
                        {/* If single case study view exists, link to it. Else contact */}
                        <Link href="/contact">
                          Discuss a similar project <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
