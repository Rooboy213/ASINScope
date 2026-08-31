import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Search, ArrowRight, Zap, Target, BarChart3, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    id: "01",
    title: "Discovery & Audit",
    description: "We dive deep into your current Amazon presence, analyzing listings, ad campaigns, market positioning, and competitors to identify immediate opportunities for growth.",
    icon: Search
  },
  {
    id: "02",
    title: "Strategic Blueprint",
    description: "Our experts craft a custom, data-backed roadmap tailored to your brand's specific goals—whether it's dominating a niche, launching new products, or maximizing profitability.",
    icon: Target
  },
  {
    id: "03",
    title: "Listing Optimization",
    description: "We overhaul your product pages with high-converting copy, A+ content, and strategic keyword placement to maximize organic visibility and conversion rates.",
    icon: Zap
  },
  {
    id: "04",
    title: "PPC Acceleration",
    description: "Our proprietary campaign architecture drives targeted traffic to your listings, optimizing ACoS and scaling profitable sales velocity.",
    icon: Rocket
  },
  {
    id: "05",
    title: "Market Dominance",
    description: "We aggressively push for BSR (Best Seller Rank) dominance through multi-channel marketing, DSP, and relentless optimization.",
    icon: BarChart3
  },
  {
    id: "06",
    title: "Iterate & Scale",
    description: "Growth is never finished. We provide transparent reporting and continuously iterate on our strategies to capture more market share.",
    icon: ArrowRight
  }
];

export default function HowItWorksPage() {
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
            The Blueprint to <span className="text-primary">Dominance</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            A proven, rigorous process that turns struggling Amazon brands into category leaders. Here's exactly how we do it.
          </motion.p>
        </div>
      </section>

      {/* Timeline Process */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2 hidden md:block" />
            
            <div className="space-y-16">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Center Node */}
                  <div className="absolute left-8 md:left-1/2 w-16 h-16 rounded-full bg-background border-4 border-muted z-10 flex items-center justify-center -translate-x-1/2 shadow-lg hidden md:flex">
                    <span className="font-display font-bold text-primary">{step.id}</span>
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                    <div className="bg-card border border-border/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 ${index % 2 !== 0 ? 'md:ml-auto' : ''}`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold font-display mb-4">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to start Step 01?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            It all begins with a comprehensive audit. Let our experts uncover the hidden revenue in your Amazon account.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8 rounded-full text-lg text-primary font-semibold" asChild>
            <Link href="/contact">Get Your Free Audit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
