import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useListFaq } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FaqPage() {
  const { data: faqs, isLoading } = useListFaq();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = faqs ? Array.from(new Set(faqs.map(faq => faq.category))) : [];
  
  const filteredFaqs = faqs?.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? faq.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-20 pb-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Frequently Asked <span className="text-primary">Questions</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Find answers to common questions about our services, process, and results.
          </motion.p>
          
          <motion.div 
            className="relative max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for answers..." 
              className="h-14 pl-10 text-lg rounded-full shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Sidebar Categories */}
            <div className="w-full md:w-64 shrink-0">
              <div className="sticky top-24">
                <h3 className="font-semibold mb-4 text-lg">Categories</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className={`text-left px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                        activeCategory === null 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Questions
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`text-left px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                          activeCategory === category 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                      <AccordionTrigger className="text-left text-base font-semibold hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-base pt-2 pb-6">
                        <div className="mb-3">
                          <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground font-normal">
                            {faq.category}
                          </Badge>
                        </div>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No questions found matching your search.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setActiveCategory(null); }}
                    className="text-primary font-medium mt-2 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
