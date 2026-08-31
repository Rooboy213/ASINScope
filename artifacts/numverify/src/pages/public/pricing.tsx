import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListPricingPlans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { data: pricingPlans, isLoading } = useListPricingPlans();

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
            Simple, Transparent <span className="text-primary">Pricing</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            No hidden fees. No surprise charges. Just straightforward pricing designed to scale with your Amazon business.
          </motion.p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-16 md:py-24 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="h-[600px]">
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-1/3 mx-auto my-6" />
                    <div className="space-y-4 mt-8">
                      {Array(6).fill(0).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              pricingPlans?.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={cn(
                    "relative h-full",
                    plan.highlighted ? "md:-mt-4 md:mb-4 z-10" : ""
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                      <Badge variant="default" className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 text-sm uppercase tracking-wider">
                        {plan.badge || "Most Popular"}
                      </Badge>
                    </div>
                  )}
                  <Card className={cn(
                    "h-full flex flex-col transition-all duration-300",
                    plan.highlighted ? "border-primary shadow-xl ring-2 ring-primary/20 bg-card" : "border-border/60 hover:border-primary/50"
                  )}>
                    <CardHeader className="text-center pb-4 pt-8">
                      <CardTitle className="text-2xl font-display">{plan.name}</CardTitle>
                      <CardDescription className="h-10 mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center flex-1">
                      <div className="mb-8 flex items-end justify-center justify-baseline">
                        <span className="text-5xl font-bold font-display">${plan.price}</span>
                        <span className="text-muted-foreground ml-2 mb-1">/{plan.billingCycle}</span>
                      </div>
                      
                      <div className="w-full h-px bg-border/50 mb-8" />
                      
                      <ul className="space-y-4 text-left">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-start">
                            <CheckCircle2 className={cn(
                              "h-5 w-5 shrink-0 mr-3 mt-0.5",
                              plan.highlighted ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className="text-sm font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-8 pb-8">
                      <Button 
                        className="w-full h-12 text-base" 
                        variant={plan.highlighted ? "default" : "outline"}
                        asChild
                      >
                        <Link href="/contact">{plan.ctaLabel}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ Sneak Peek */}
      <section className="py-24 bg-muted/20 border-t">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-display font-bold mb-6">Need a custom enterprise solution?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            For 8-figure+ brands that require dedicated teams and custom API integrations, we offer bespoke enterprise packages tailored to your specific infrastructure.
          </p>
          <Button variant="default" size="lg" asChild className="rounded-full">
            <Link href="/contact">Contact Enterprise Sales</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
