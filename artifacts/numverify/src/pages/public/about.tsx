import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Globe2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSiteStats } from "@workspace/api-client-react";

export default function AboutPage() {
  const { data: stats } = useGetSiteStats();

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
            We Build <span className="text-primary">Amazon Empires</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            NumVerify is an elite team of Amazon specialists, data scientists, and growth hackers dedicated to one thing: scaling your brand.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-primary mb-2">
                {stats ? stats.yearsExperience : 8}+
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Years Experience</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-primary mb-2">
                {stats ? stats.expertSpecialists : 45}+
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">In-House Experts</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-primary mb-2">
                {stats ? stats.brandsServed : 500}+
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Brands Scaled</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-primary mb-2">
                ${stats ? stats.revenueInfluencedMillions : 50}M+
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Revenue Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-muted/20 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-6">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                NumVerify started with a simple observation: the Amazon marketplace was becoming too complex for traditional marketing agencies to handle. Brands needed specialists, not generalists.
              </p>
              <p>
                We assembled a team of former Amazon insiders, data scientists, and supply chain experts. We built proprietary tools to reverse-engineer the A9 algorithm. We tested, failed, learned, and ultimately mastered the art of organic ranking and PPC acceleration.
              </p>
              <p>
                Today, we manage tens of millions in Amazon revenue for ambitious brands across the globe. Our approach remains the same: data-driven decisions, aggressive execution, and complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Core Values</h2>
            <p className="text-muted-foreground text-lg">The principles that guide every strategy we deploy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-6 rounded-2xl border border-border/50 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Data Over Ego</h3>
              <p className="text-muted-foreground text-sm">We don't guess. Every decision is backed by hard numbers and rigorous testing.</p>
            </div>
            
            <div className="bg-card p-6 rounded-2xl border border-border/50 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Relentless Execution</h3>
              <p className="text-muted-foreground text-sm">Strategy is nothing without speed and flawless implementation.</p>
            </div>
            
            <div className="bg-card p-6 rounded-2xl border border-border/50 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">True Partnership</h3>
              <p className="text-muted-foreground text-sm">We act as an extension of your team, completely aligned with your bottom line.</p>
            </div>
            
            <div className="bg-card p-6 rounded-2xl border border-border/50 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Total Transparency</h3>
              <p className="text-muted-foreground text-sm">No black boxes. You'll always know exactly what we're doing and why.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Want us on your team?</h2>
          <Button size="lg" variant="secondary" className="h-14 px-8 rounded-full text-lg text-primary font-semibold" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
