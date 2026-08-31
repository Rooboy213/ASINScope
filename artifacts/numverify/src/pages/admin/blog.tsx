import React from "react";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { useListBlogPosts, useDeleteBlogPost } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminBlog() {
  const { data: blogData, isLoading, refetch } = useListBlogPosts();
  const deleteBlogPost = useDeleteBlogPost();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteBlogPost.mutate({ id }, {
      onSuccess: () => { toast({ title: "Post deleted" }); refetch(); },
      onError: () => toast({ title: "Error deleting post", variant: "destructive" }),
    });
  };

  const posts = blogData?.posts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage all blog content and articles.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>{posts.length} posts total.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <Badge variant="outline" className={post.published
                        ? "bg-accent/10 text-accent border-accent/20 text-xs"
                        : "bg-muted text-muted-foreground border-border text-xs"
                      }>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{post.category}</span>
                      <span>·</span>
                      <span>{post.authorName}</span>
                      <span>·</span>
                      <span>{post.readTimeMinutes} min read</span>
                      {post.publishedAt && <><span>·</span><span>{formatDate(post.publishedAt)}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete "{post.title}". This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
              <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No blog posts yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
