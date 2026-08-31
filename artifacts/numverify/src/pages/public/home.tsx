import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, ChevronRight, Quote, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSiteStats, useListServices, useListTestimonials, useListPricingPlans, useListFaq } from "@workspace/api-client-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { data: stats } = useGetSiteStats();
  const { data: services } = useListServices();
  const { data: testimonials } = useListTestimonials();
  const { data: pricingPlans } = useListPricingPlans();
  const { data: faqs } = useListFaq();

  const featuredServices = services?.filter(s => s.featured).slice(0, 6) || [];
  const featuredTestimonials = testimonials?.filter(t => t.featured) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute right-0 top-1/4 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] opacity-20 bg-secondary/30 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 border-primary/50 text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                Amazon growth for operators
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
                Know what moves the needle.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Then scale it.
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              NumVerify gives operators a clear line from marketplace data to profitable growth — what changed, what matters, and what to do next.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full" asChild>
                <Link href="/contact">
                  Get a category diagnosis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full" asChild>
                <Link href="/case-studies">View Case Studies</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Products Supported", value: stats ? `${(stats.productsSupported / 1000).toFixed(0)}k+` : "10k+", suffix: "" },
              { label: "Brands Served", value: stats ? `${stats.brandsServed}+` : "500+", suffix: "" },
              { label: "Client Satisfaction", value: stats ? `${stats.satisfactionRate}%` : "98%", suffix: "" },
              { label: "Revenue Influenced", value: stats ? `$${stats.revenueInfluencedMillions}M+` : "$50M+", suffix: "" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h3 className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-b bg-card py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Operators, not spectators</p>
              <p className="mt-3 font-display text-xl font-semibold leading-tight">The teams we work with do not need more activity. They need better calls.</p>
            </div>
            <div className="grid flex-1 gap-6 sm:grid-cols-3 lg:max-w-3xl lg:pl-16">
              {[
                { eyebrow: "01", title: "Category-aware", copy: "Every recommendation starts with the economics of your aisle." },
                { eyebrow: "02", title: "Evidence-led", copy: "Rank, retail readiness, and contribution margin in the same room." },
                { eyebrow: "03", title: "Accountable", copy: "A clear owner, a clear next move, and a scorecard to prove it." },
              ].map((item) => (
                <div key={item.eyebrow} className="border-l border-border pl-4" data-testid={`trust-point-${item.eyebrow}`}>
                  <span className="font-mono text-xs text-secondary">{item.eyebrow}</span>
                  <p className="mt-2 font-display font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">The Complete Growth Arsenal</h2>
            <p className="text-muted-foreground text-lg">Everything you need to capture market share and scale your brand on Amazon.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.length > 0 ? featuredServices.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full bg-card hover:bg-muted/50 transition-colors border-border/50 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href="/services" className="text-primary text-sm font-medium flex items-center hover:underline">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            )) : (
              // Loading state
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild className="rounded-full">
              <Link href="/services">View All 18 Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-muted/20 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Transparent Pricing for Serious Brands</h2>
            <p className="text-muted-foreground text-lg">Choose the right tier to accelerate your Amazon business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans?.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  "relative",
                  plan.highlighted ? "md:-mt-4 md:mb-4" : ""
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <Badge variant="default" className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                      {plan.badge || "Most Popular"}
                    </Badge>
                  </div>
                )}
                <Card className={cn(
                  "h-full flex flex-col transition-all duration-300 hover:shadow-xl",
                  plan.highlighted ? "border-primary shadow-lg ring-1 ring-primary" : "border-border/50"
                )}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center flex-1">
                    <div className="my-6">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-2">/{plan.billingCycle}</span>
                    </div>
                    <ul className="space-y-3 text-left mt-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mr-3 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                      asChild
                    >
                      <Link href="/contact">{plan.ctaLabel}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Model */}
      <section className="border-y bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/65">How growth gets de-risked</p>
              <h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] md:text-5xl">A tighter loop from signal to sale.</h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-primary-foreground/75">
                We replace channel noise with an operating cadence your team can actually run: diagnose, decide, deploy, learn.
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-8 rounded-full px-6">
                <Link href="/rank-tracker" data-testid="link-home-rank-tracker">See a live marketplace signal <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-0 border-t border-primary-foreground/20">
              {[
                { step: "01", title: "Diagnose the constraint", copy: "We find the bottleneck hiding behind the topline: discoverability, conversion, retail readiness, or the economics of the offer." },
                { step: "02", title: "Choose the profitable lever", copy: "The plan is sequenced around impact and effort, so your team knows what not to do yet." },
                { step: "03", title: "Deploy with a measurement plan", copy: "Every change has a baseline, a leading indicator, and a date when we decide whether it worked." },
                { step: "04", title: "Compound what works", copy: "Winners become playbooks. Learnings travel across your catalog instead of disappearing in a deck." },
              ].map((item) => (
                <div key={item.step} className="grid gap-4 border-b border-primary-foreground/20 py-6 sm:grid-cols-[72px_180px_1fr] sm:items-start">
                  <span className="font-mono text-xs text-secondary">{item.step}</span>
                  <p className="font-display text-lg font-semibold">{item.title}</p>
                  <p className="text-sm leading-relaxed text-primary-foreground/70">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Proof */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-14">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Proof over promises</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold">The work should show up in the numbers.</h2>
              <p className="mt-4 text-lg text-muted-foreground">Our clients do not hire us for more dashboards. They hire us to make the next decision clearer and the result easier to defend.</p>
            </div>
            <Button variant="outline" className="w-fit rounded-full" asChild>
              <Link href="/case-studies">Read the case studies <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(featuredTestimonials.length > 0 ? featuredTestimonials.slice(0, 3) : []).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Card className="h-full border-border/60 bg-card">
                  <CardContent className="flex h-full flex-col p-7">
                    <Quote className="h-7 w-7 text-secondary mb-6" />
                    <p className="text-base leading-relaxed flex-1">“{testimonial.text}”</p>
                    <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={testimonial.avatarUrl ?? undefined} alt={testimonial.clientName} />
                        <AvatarFallback className="bg-primary/10 text-primary">{testimonial.clientName.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.clientName}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.clientTitle}, {testimonial.company}</p>
                      </div>
                    </div>
                    {testimonial.metrics && (
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-accent">{testimonial.metrics}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about working with NumVerify.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs && faqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {faqs.slice(0, 6).map((faq) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                    <AccordionTrigger className="text-left text-base font-semibold">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            )}
            
            <div className="mt-10 text-center">
              <Button variant="ghost" asChild>
                <Link href="/faq">View All FAQs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">Know your next profitable move.</h2>
          <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10">
            Bring the signal, the constraint, or the stubborn plateau. We will help you turn it into a plan your team can run.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold rounded-full text-primary" asChild>
              <Link href="/contact">Get Your Free Audit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
