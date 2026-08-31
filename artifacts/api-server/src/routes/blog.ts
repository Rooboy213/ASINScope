import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc, ilike, sql } from "drizzle-orm";
import {
  ListBlogPostsQueryParams,
  GetBlogPostParams,
  UpdateBlogPostParams,
  DeleteBlogPostParams,
  CreateBlogPostBody,
  UpdateBlogPostBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/blog/posts", async (req, res): Promise<void> => {
  const params = ListBlogPostsQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 20;
  const offset = params.success && params.data.offset ? params.data.offset : 0;
  const category = params.success ? params.data.category : undefined;

  let query = db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));

  const allPosts = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
  let filtered = allPosts.filter(p => p.published);
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  const total = filtered.length;
  const posts = filtered.slice(offset, offset + limit).map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverImageUrl: p.coverImageUrl ?? null,
    category: p.category,
    tags: p.tags ?? [],
    authorName: p.authorName,
    authorAvatarUrl: p.authorAvatarUrl ?? null,
    published: p.published,
    readTimeMinutes: p.readTimeMinutes,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json({ posts, total });
});

router.get("/blog/posts/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    res.status(400).json({ error: "Slug required" });
    return;
  }
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? null,
    category: post.category,
    tags: post.tags ?? [],
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl ?? null,
    published: post.published,
    readTimeMinutes: post.readTimeMinutes,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  });
});

router.post("/blog/posts", async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [post] = await db.insert(blogPostsTable).values({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.coverImageUrl ?? null,
    category: data.category,
    tags: data.tags ?? [],
    authorName: data.authorName,
    authorAvatarUrl: null,
    published: data.published ?? false,
    readTimeMinutes: data.readTimeMinutes,
    publishedAt: data.published ? new Date() : null,
  }).returning();
  res.status(201).json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? null,
    category: post.category,
    tags: post.tags ?? [],
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl ?? null,
    published: post.published,
    readTimeMinutes: post.readTimeMinutes,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  });
});

router.patch("/blog/posts/:id/update", async (req, res): Promise<void> => {
  const params = UpdateBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.title !== undefined) updates.title = d.title;
  if (d.excerpt !== undefined) updates.excerpt = d.excerpt;
  if (d.content !== undefined) updates.content = d.content;
  if (d.coverImageUrl !== undefined) updates.coverImageUrl = d.coverImageUrl;
  if (d.category !== undefined) updates.category = d.category;
  if (d.tags !== undefined) updates.tags = d.tags;
  if (d.published !== undefined) updates.published = d.published;
  if (d.readTimeMinutes !== undefined) updates.readTimeMinutes = d.readTimeMinutes;

  const [post] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, params.data.id)).returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? null,
    category: post.category,
    tags: post.tags ?? [],
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl ?? null,
    published: post.published,
    readTimeMinutes: post.readTimeMinutes,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  });
});

router.delete("/blog/posts/:id/delete", async (req, res): Promise<void> => {
  const params = DeleteBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, params.data.id));
  res.json({ message: "Post deleted" });
});

router.get("/blog/categories", async (req, res): Promise<void> => {
  const posts = await db.select({ category: blogPostsTable.category }).from(blogPostsTable).where(eq(blogPostsTable.published, true));
  const categoryCounts: Record<string, number> = {};
  for (const p of posts) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }
  const categories = Object.entries(categoryCounts).map(([name, count], idx) => ({
    id: idx + 1,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    postCount: count,
  }));
  res.json(categories);
});

export default router;
