import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export default function BlogPage() {
  const { data: blogData, isLoading } = useListBlogPosts();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-20 pb-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Insights & <span className="text-primary">Strategies</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            The latest tactics, Amazon updates, and growth strategies from our elite team of marketplace experts.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-full flex flex-col overflow-hidden">
                  <div className="h-48 bg-muted w-full animate-pulse" />
                  <CardHeader>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : blogData?.posts?.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group cursor-pointer border-border/50">
                  <div className="h-48 bg-muted overflow-hidden relative">
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                        <span className="text-primary/40 font-display font-bold text-4xl">NumVerify</span>
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4" variant="secondary">
                      {post.category}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTimeMinutes} min read
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </CardContent>
                  <CardFooter className="pt-4 pb-5 border-t mt-auto flex justify-between items-center bg-muted/5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold uppercase">
                        {post.authorName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{post.authorName}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="px-2 hover:bg-transparent text-primary" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {blogData?.posts && blogData.posts.length === 0 && (
            <div className="text-center py-24 border rounded-xl bg-muted/20">
              <p className="text-xl text-muted-foreground">Check back soon for new insights.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
