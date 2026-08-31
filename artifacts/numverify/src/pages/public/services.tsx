import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useListServices } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ServicesPage() {
  const { data: services, isLoading } = useListServices();

  const categories = services 
    ? Array.from(new Set(services.map(s => s.category))) 
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our Arsenal of <span className="text-primary">Growth Solutions</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Comprehensive, data-driven services designed to capture market share, maximize profitability, and scale your brand on Amazon.
          </motion.p>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-16 md:py-24 flex-1">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {Array(9).fill(0).map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Tabs defaultValue={categories[0] || "all"} className="w-full">
              <div className="flex justify-center mb-12 overflow-x-auto pb-4">
                <TabsList className="h-auto p-1 bg-muted/50 rounded-full">
                  <TabsTrigger value="all" className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow">
                    All Services
                  </TabsTrigger>
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services?.map((service, i) => (
                    <ServiceCard key={service.id} service={service} index={i} />
                  ))}
                </div>
              </TabsContent>

              {categories.map(cat => (
                <TabsContent key={cat} value={cat} className="mt-0 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services?.filter(s => s.category === cat).map((service, i) => (
                      <ServiceCard key={service.id} service={service} index={i} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Not sure which service you need?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            Get a free comprehensive audit of your Amazon account. We'll identify exactly where you're losing money and how to fix it.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8 rounded-full text-lg text-primary font-semibold" asChild>
            <Link href="/contact">Request Free Audit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, index }: { service: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="h-full bg-card hover:bg-muted/50 transition-colors border-border/50 group flex flex-col">
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
            {/* Can map icon string to actual lucide icons here */}
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{service.title}</CardTitle>
          <CardDescription className="line-clamp-3">{service.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 mt-2">
            <li className="flex items-start text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mr-2 mt-0.5" />
              Strategic planning
            </li>
            <li className="flex items-start text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mr-2 mt-0.5" />
              Execution & monitoring
            </li>
            <li className="flex items-start text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mr-2 mt-0.5" />
              Performance reporting
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
            <Link href="/contact">Get Started</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
