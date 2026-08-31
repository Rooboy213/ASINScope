import React from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { useGetBlogPost } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const { data: post, isLoading, isError } = useGetBlogPost(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Skeleton className="h-5 w-28 mb-8" />
        <Skeleton className="h-12 w-4/5 mb-4" />
        <Skeleton className="h-5 w-2/3 mb-12" />
        <Skeleton className="h-80 w-full mb-10" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Article not found</h1>
        <p className="text-muted-foreground mb-8">This article may have been moved or is no longer published.</p>
        <Button asChild><Link href="/blog">Back to insights</Link></Button>
      </div>
    );
  }

  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
      <Button variant="ghost" className="mb-10 -ml-3 text-muted-foreground hover:text-primary" asChild>
        <Link href="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Back to insights</Link>
      </Button>

      <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Badge variant="secondary" className="mb-5">{post.category}</Badge>
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.05] mb-6">
          {post.title}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mb-7">{post.excerpt}</p>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{post.authorName}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt || post.createdAt)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readTimeMinutes} min read</span>
        </div>
      </motion.header>

      {post.coverImageUrl ? (
        <img src={post.coverImageUrl} alt="" className="w-full aspect-[2/1] object-cover rounded-2xl mt-12 mb-12" />
      ) : (
        <div className="w-full aspect-[2/1] rounded-2xl mt-12 mb-12 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 border flex items-center justify-center">
          <span className="font-display font-bold text-5xl md:text-7xl text-primary/30">NumVerify</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <aside className="hidden lg:block">
          <Card className="sticky top-28 bg-primary text-primary-foreground border-0">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70 mb-3">Ready to grow?</p>
              <h2 className="font-display text-xl font-bold mb-4">Turn strategy into revenue.</h2>
              <Button variant="secondary" className="w-full text-primary" asChild>
                <Link href="/contact">Get your free audit <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}