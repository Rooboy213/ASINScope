import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  Globe2,
  Image as ImageIcon,
  Layers3,
  LineChart,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import {
  RankTrackerInput,
  RankTrackerInputMarketplace,
  RankTrackerResult,
  useLookupRankTracker,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type JsonObject = Record<string, unknown>;
type TrackerForm = {
  asin: string;
  keyword: string;
  marketplace: RankTrackerInputMarketplace;
};

const marketplaces: Array<{ value: RankTrackerInputMarketplace; label: string; domain: string }> = [
  { value: "US", label: "United States", domain: "amazon.com" },
  { value: "CA", label: "Canada", domain: "amazon.ca" },
  { value: "UK", label: "United Kingdom", domain: "amazon.co.uk" },
  { value: "DE", label: "Germany", domain: "amazon.de" },
  { value: "FR", label: "France", domain: "amazon.fr" },
  { value: "IT", label: "Italy", domain: "amazon.it" },
  { value: "ES", label: "Spain", domain: "amazon.es" },
  { value: "JP", label: "Japan", domain: "amazon.co.jp" },
  { value: "AU", label: "Australia", domain: "amazon.com.au" },
  { value: "IN", label: "India", domain: "amazon.in" },
];

const exampleForm: TrackerForm = { asin: "B0C7Q2L8M4", keyword: "collagen peptides", marketplace: "US" };

function isObject(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function payloadData(value: unknown): JsonObject {
  if (isObject(value) && isObject(value.data)) return value.data;
  return isObject(value) ? value : {};
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function firstString(data: JsonObject, ...keys: string[]) {
  for (const key of keys) {
    const value = stringValue(data[key]);
    if (value) return value;
  }
  return null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function firstNumber(data: JsonObject, ...keys: string[]) {
  for (const key of keys) {
    const value = numberValue(data[key]);
    if (value !== null) return value;
  }
  return null;
}

function firstArray(data: JsonObject, ...keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  return [];
}

function formatLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not supplied";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return Array.isArray(value) ? `${value.length} items` : `${Object.keys(value as JsonObject).length} fields`;
  return String(value);
}

function formatTrackedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function formatMoney(value: number | null | undefined, currency: string) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Not supplied";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD" }).format(value);
  } catch {
    return `${currency || "USD"} ${value.toFixed(2)}`;
  }
}

function ratingFrom(value: unknown) {
  return numberValue(value) ?? 0;
}

function bestSellerRank(data: JsonObject) {
  const raw = data.product_bestseller_rank;
  const entries = Array.isArray(raw) ? raw.filter(isObject) : isObject(raw) ? [raw] : [];
  const formatted = entries.map((entry) => {
    const rank = firstNumber(entry, "rank", "value", "position");
    const category = firstString(entry, "category", "name", "title");
    return rank === null ? category : `${category ?? "Category"} #${rank.toLocaleString()}`;
  }).filter(Boolean);
  return formatted.length ? formatted.join(" · ") : formatValue(data.sales_rank ?? data.rank);
}

function variationSummary(data: JsonObject) {
  const dimensions = firstArray(data, "product_variations_dimensions", "variation_dimensions").filter((item): item is string => typeof item === "string");
  const variations = data.product_variations;
  const count = isObject(variations) ? Object.keys(variations).length : Array.isArray(variations) ? variations.length : 0;
  if (!dimensions.length && !count) return "Not supplied";
  return `${count ? `${count} variation${count === 1 ? "" : "s"}` : "Variations returned"}${dimensions.length ? ` · ${dimensions.join(", ")}` : ""}`;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-secondary" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Star key={item} className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5", item <= Math.round(rating) ? "fill-current" : "fill-transparent")} />
      ))}
    </span>
  );
}

function TrendLine({ result }: { result: RankTrackerResult }) {
  const points = Array.isArray(result.trend) ? result.trend : [];
  const values = points.map((point) => point.rank).filter((value) => typeof value === "number");
  if (values.length < 2) {
    return <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center text-sm text-muted-foreground" data-testid="empty-trend">{result.currentRank === null ? "The provider returned no rank history for this ASIN." : "A second observation is needed before a trend can be plotted."}</div>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const linePoints = values.map((value, index) => `${(index / (values.length - 1)) * 100},${10 + ((value - min) / range) * 72}`).join(" ");
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-[linear-gradient(180deg,hsl(var(--secondary)/.13),transparent)] p-4" data-testid="chart-rank-trend">
      <div className="pointer-events-none absolute inset-x-4 top-4 bottom-5 flex flex-col justify-between">{[0, 1, 2].map((line) => <div key={line} className="border-t border-dashed border-border/70" />)}</div>
      <svg viewBox="0 0 100 92" preserveAspectRatio="none" className="relative h-full w-full" aria-label="Organic rank trend chart">
        <defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity=".32" /><stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" /></linearGradient></defs>
        <polygon points={`0,92 ${linePoints} 100,92`} fill="url(#trend-fill)" />
        <polyline points={linePoints} fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
        {values.map((value, index) => <circle key={`${value}-${index}`} cx={(index / (values.length - 1)) * 100} cy={10 + ((value - min) / range) * 72} r="1.7" fill="hsl(var(--secondary))" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="absolute inset-x-4 bottom-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span>{points[0]?.date}</span><span>{points[points.length - 1]?.date}</span></div>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, accent = false, testId }: { label: string; value: string; detail?: string; icon: typeof BarChart3; accent?: boolean; testId: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", accent && "border-secondary/45 bg-secondary/10")} data-testid={testId}>
      <div className="flex items-center justify-between gap-2"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">{label}</p><Icon className={cn("h-4 w-4", accent ? "text-secondary" : "text-primary/70")} /></div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function ImageRail({ result, details }: { result: RankTrackerResult; details: JsonObject }) {
  const images = useMemo(() => {
    const values = [result.imageUrl, ...firstArray(details, "product_photos", "product_images"), ...firstArray(details, "aplus_images")].filter((value): value is string => typeof value === "string" && value.startsWith("http"));
    return [...new Set(values)];
  }, [details, result.imageUrl]);
  const [activeImage, setActiveImage] = useState(0);
  const image = images[activeImage] ?? images[0];
  return (
    <div className="space-y-3" data-testid="product-image-gallery">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/35">
        {image ? <img src={image} alt={result.productTitle || "Amazon product"} className="h-full w-full object-contain p-7" data-testid="img-product-primary" /> : <div className="flex flex-col items-center gap-3 text-muted-foreground"><ImageIcon className="h-10 w-10 stroke-1" /><span className="font-mono text-[10px] uppercase tracking-wider">No product image</span></div>}
        {images.length > 1 && <span className="absolute bottom-3 right-3 rounded-full border border-border bg-card/90 px-2 py-1 font-mono text-[10px] text-muted-foreground">{activeImage + 1} / {images.length}</span>}
      </div>
      {images.length > 1 && <div className="grid grid-cols-5 gap-2">{images.slice(0, 5).map((src, index) => <button key={src} type="button" onClick={() => setActiveImage(index)} className={cn("aspect-square overflow-hidden rounded-lg border bg-card p-1 transition-colors", activeImage === index ? "border-primary" : "border-border")} data-testid={`button-gallery-image-${index}`}><img src={src} alt={`Product view ${index + 1}`} className="h-full w-full object-contain" /></button>)}</div>}
    </div>
  );
}

function RatingDistribution({ details, reviews }: { details: JsonObject; reviews: JsonObject }) {
  const distribution = (isObject(reviews.rating_distribution) ? reviews.rating_distribution : isObject(details.rating_distribution) ? details.rating_distribution : {}) as JsonObject;
  const entries = [5, 4, 3, 2, 1].map((rating) => [String(rating), numberValue(distribution[String(rating)]) ?? 0] as const);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  return (
    <div className="space-y-2" data-testid="rating-distribution">
      {entries.map(([rating, value]) => {
        const percent = total ? Math.round((value / total) * 100) : 0;
        return <div key={rating} className="flex items-center gap-3 text-xs"><span className="w-8 font-mono text-muted-foreground">{rating} star</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary" style={{ width: `${percent}%` }} /></div><span className="w-9 text-right font-mono text-muted-foreground">{total ? `${percent}%` : "—"}</span></div>;
      })}
      {!total && <p className="pt-1 text-xs text-muted-foreground">No rating distribution was returned by the reviews endpoint.</p>}
    </div>
  );
}

function DetailList({ title, icon: Icon, items }: { title: string; icon: typeof Tag; items: Array<[string, unknown]> }) {
  const present = items.filter(([, value]) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0));
  if (!present.length) return null;
  return <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold">{title}</h3></div><dl className="mt-4 divide-y divide-border">{present.map(([label, value]) => <div key={label} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="max-w-[70%] text-right text-sm font-medium">{formatValue(value)}</dd></div>)}</dl></div>;
}

function ProductOverview({ result, details, reviews }: { result: RankTrackerResult; details: JsonObject; reviews: JsonObject }) {
  const bullets = firstArray(details, "about_product", "feature_bullets", "bullets").filter((item): item is string => typeof item === "string");
  const description = firstString(details, "product_description", "description");
  const category = isObject(details.category) ? firstString(details.category, "name") : stringValue(details.category);
  const byline = firstString(details, "product_byline", "byline");
  const productUrl = firstString(details, "product_url", "url");
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.72fr)]">
        <Card className="overflow-hidden border-border shadow-none">
          <CardHeader className="border-b border-border bg-muted/25 pb-4"><div className="flex items-center gap-2"><Box className="h-4 w-4 text-primary" /><CardTitle className="text-base">Listing readout</CardTitle></div></CardHeader>
          <CardContent className="grid gap-6 pt-6 sm:grid-cols-[.9fr_1.1fr]">
            <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Title</p><h3 className="mt-2 font-display text-xl font-semibold leading-snug">{result.productTitle || "Title not supplied"}</h3>{byline && <p className="mt-3 text-sm text-muted-foreground">{byline}</p>}{productUrl && <a href={productUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline" data-testid="link-amazon-product">Open product page <ExternalLink className="h-3.5 w-3.5" /></a>}</div>
            <div className="grid grid-cols-2 gap-3"><Metric label="Price" value={formatMoney(firstNumber(details, "product_price", "price") ?? result.price, result.currency)} detail={firstString(details, "product_original_price") ? `Was ${firstString(details, "product_original_price")}` : undefined} icon={Tag} accent testId="metric-overview-price" /><Metric label="Reviews" value={result.reviewCount ? result.reviewCount.toLocaleString() : "Not supplied"} detail={result.rating ? `${result.rating.toFixed(1)} average rating` : undefined} icon={Users} testId="metric-overview-reviews" /></div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none"><CardHeader className="pb-3"><div className="flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /><CardTitle className="text-base">Customer signal</CardTitle></div></CardHeader><CardContent><div className="flex items-end gap-3"><span className="font-display text-4xl font-semibold">{result.rating ? result.rating.toFixed(1) : "—"}</span><div className="pb-1"><Stars rating={result.rating} size="md" /><p className="mt-1 text-xs text-muted-foreground">{result.reviewCount ? `${result.reviewCount.toLocaleString()} ratings` : "Rating count unavailable"}</p></div></div><div className="mt-5"><RatingDistribution details={details} reviews={reviews} /></div></CardContent></Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <DetailList title="Product positioning" icon={Layers3} items={[["Brand", result.brand], ["Category", category], ["Best seller rank", bestSellerRank(details)], ["Sales volume", firstString(details, "sales_volume")], ["Condition", firstString(details, "product_condition")], ["Availability", firstString(details, "product_availability")], ["Prime eligible", details.is_prime], ["Variations", variationSummary(details)]]} />
        <DetailList title="Buy box context" icon={ShoppingBag} items={(() => { const buyBox = isObject(details.main_buy_box) ? details.main_buy_box : {}; return [["Seller", firstString(buyBox, "seller", "title")], ["Offer price", firstString(buyBox, "price")], ["Return policy", firstString(buyBox, "return_policy")], ["Seller ID", firstString(buyBox, "seller_id")]]; })()} />
      </div>
      {(bullets.length > 0 || description) && <Card className="border-border shadow-none"><CardHeader className="pb-3"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /><CardTitle className="text-base">Content surface</CardTitle></div></CardHeader><CardContent className="grid gap-6 pt-0 sm:grid-cols-2">{bullets.length > 0 && <div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Key bullets</p><ul className="mt-3 space-y-3">{bullets.map((bullet, index) => <li key={`${bullet}-${index}`} className="flex gap-3 text-sm leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{bullet}</li>)}</ul></div>}{description && <div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Description</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p></div>}</CardContent></Card>}
    </div>
  );
}

function OffersPanel({ offers }: { offers: JsonObject }) {
  const offerRows = firstArray(offers, "product_offers", "offers").filter(isObject);
  if (!offerRows.length) return <EmptyPanel icon={Store} title="No offer rows returned" copy="The offers endpoint responded without a structured offer list." />;
  return <Card className="border-border shadow-none"><CardHeader><div className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" /><CardTitle className="text-base">Available offers</CardTitle><Badge variant="outline" className="ml-auto">{offerRows.length} returned</Badge></div></CardHeader><CardContent className="pt-0"><Table><TableHeader><TableRow><TableHead>Condition</TableHead><TableHead>Price</TableHead><TableHead>Seller</TableHead><TableHead>Ships from</TableHead><TableHead>Delivery</TableHead></TableRow></TableHeader><TableBody>{offerRows.map((offer, index) => <TableRow key={`offer-${index}`} data-testid={`row-offer-${index}`}><TableCell className="font-medium">{formatValue(offer.product_condition ?? offer.condition)}</TableCell><TableCell className="font-semibold">{formatValue(offer.product_price ?? offer.price)}</TableCell><TableCell>{formatValue(offer.seller)}</TableCell><TableCell>{formatValue(offer.ships_from)}</TableCell><TableCell>{formatValue(offer.delivery_time ?? offer.delivery_price)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>;
}

function ReviewCard({ review, index }: { review: JsonObject; index: number }) {
  const rating = ratingFrom(review.review_star_rating ?? review.rating);
  return <div className="rounded-xl border border-border bg-card p-5" data-testid={`card-review-${index}`}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">{(firstString(review, "review_author", "author") ?? "A").slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-semibold">{firstString(review, "review_author", "author") ?? "Anonymous shopper"}</p><div className="flex items-center gap-2"><Stars rating={rating} /><span className="text-xs text-muted-foreground">{review.is_verified_purchase ? "Verified purchase" : "Purchase status unavailable"}</span></div></div></div><span className="font-mono text-[10px] text-muted-foreground">{formatValue(review.review_date ?? review.date)}</span></div><p className="mt-4 font-display font-semibold">{firstString(review, "review_title", "title") ?? "Untitled review"}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{firstString(review, "review_comment", "comment", "content") ?? "Review text was not supplied."}</p></div>;
}

function ReviewsPanel({ reviews, topReviews }: { reviews: JsonObject; topReviews: JsonObject }) {
  const latest = firstArray(reviews, "reviews", "product_reviews").filter(isObject);
  const top = firstArray(topReviews, "reviews", "top_reviews").filter(isObject);
  const selected = [...top, ...latest];
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><Card className="border-border shadow-none"><CardHeader className="pb-3"><div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /><CardTitle className="text-base">Review analytics</CardTitle></div></CardHeader><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Total ratings</p><p className="mt-1 font-display text-3xl font-semibold">{formatValue(reviews.total_ratings)}</p><div className="mt-5"><RatingDistribution details={{}} reviews={reviews} /></div></CardContent></Card><Card className="border-border shadow-none"><CardHeader className="pb-3"><div className="flex items-center gap-2"><MessageIcon /><CardTitle className="text-base">Review evidence</CardTitle></div></CardHeader><CardContent className="pt-0"><p className="text-sm leading-6 text-muted-foreground">Separate provider feeds make it easier to distinguish recent customer language from the highest-signal review set.</p><div className="mt-4 flex flex-wrap gap-2"><Badge variant="secondary">{selected.length} reviews available</Badge>{top.length > 0 && <Badge variant="outline">Top reviews endpoint</Badge>}{latest.length > 0 && <Badge variant="outline">Latest reviews endpoint</Badge>}</div></CardContent></Card></div>{top.length > 0 && <div><div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-secondary" /><h3 className="font-display font-semibold">Top reviews</h3><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">High-signal set</span></div><div className="grid gap-4 lg:grid-cols-2">{top.map((review, index) => <ReviewCard key={`top-${firstString(review, "review_id", "id") ?? "review"}-${index}`} review={review} index={index} />)}</div></div>}{latest.length > 0 && <div><div className="mb-3 flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold">Latest reviews</h3><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Recent customer language</span></div><div className="grid gap-4 lg:grid-cols-2">{latest.map((review, index) => <ReviewCard key={`latest-${firstString(review, "review_id", "id") ?? "review"}-${index}`} review={review} index={index + top.length} />)}</div></div>}{!selected.length && <EmptyPanel icon={Users} title="No review records returned" copy="The review endpoints did not include individual review records for this lookup." />}</div>;
}

function MessageIcon() {
  return <div className="flex h-4 w-4 items-center justify-center rounded border border-primary/50 text-[9px] font-bold text-primary">R</div>;
}

function EmptyPanel({ icon: Icon, title, copy }: { icon: typeof Database; title: string; copy: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/25 px-6 text-center"><Icon className="h-7 w-7 text-muted-foreground" /><p className="mt-3 font-display font-semibold">{title}</p><p className="mt-1 max-w-md text-sm text-muted-foreground">{copy}</p></div>;
}

function JsonExplorer({ value, path = "root", depth = 0 }: { value: unknown; path?: string; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  if (Array.isArray(value)) {
    return <div className="ml-3 border-l border-border pl-3">{value.length ? value.map((item, index) => <JsonExplorer key={`${path}-${index}`} value={item} path={`${path}.${index}`} depth={depth + 1} />) : <p className="py-2 text-xs text-muted-foreground">Empty list</p>}</div>;
  }
  if (isObject(value)) {
    return <div className={cn(depth > 0 && "ml-3 border-l border-border pl-3")}>{Object.entries(value).map(([key, item]) => { const complex = Array.isArray(item) || isObject(item); return <div key={`${path}.${key}`} className="border-b border-border/70 py-3 last:border-0"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-2">{complex && <button type="button" onClick={() => setOpen(!open)} className="mt-0.5 text-muted-foreground" aria-label={`${open ? "Collapse" : "Expand"} ${formatLabel(key)}`} data-testid={`button-explorer-${path}-${key}`}>{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>}<span className="break-words font-mono text-xs text-primary">{formatLabel(key)}</span></div>{!complex && <span className="max-w-[55%] break-words text-right text-sm text-foreground">{formatValue(item)}</span>}</div>{complex && open && <JsonExplorer value={item} path={`${path}.${key}`} depth={depth + 1} />}</div>; })}</div>;
  }
  return <span className="text-sm">{formatValue(value)}</span>;
}

function FieldExplorer({ result }: { result: RankTrackerResult }) {
  const payloads: Array<[string, unknown]> = [["Product details", result.productDetails], ["Offers", result.offers], ["Reviews", result.reviews], ["Top reviews", result.topReviews]];
  return <div className="space-y-4" data-testid="section-field-explorer"><div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-start gap-3"><Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p className="text-sm leading-6 text-muted-foreground">A complete provider payload view. Expand any object to inspect the exact fields returned for this ASIN; missing endpoints remain visible as empty states.</p></div></div>{payloads.map(([label, payload]) => <Card key={label} className="border-border shadow-none"><CardHeader className="border-b border-border bg-muted/20 py-4"><div className="flex items-center justify-between"><CardTitle className="text-sm">{label}</CardTitle><Badge variant={payload ? "success" : "outline"}>{payload ? "Payload returned" : "Not returned"}</Badge></div></CardHeader><CardContent className="pt-2">{payload ? <JsonExplorer value={payload} path={label} /> : <p className="py-4 text-sm text-muted-foreground">No payload was returned for this endpoint.</p>}</CardContent></Card>)}</div>;
}

function EndpointHealth({ result }: { result: RankTrackerResult }) {
  const endpoints: Array<[string, unknown, string]> = [["Product details", result.productDetails, "productDetails"], ["Offers", result.offers, "offers"], ["Reviews", result.reviews, "reviews"], ["Top reviews", result.topReviews, "topReviews"]];
  const errors = result.endpointErrors ?? {};
  return <div className="rounded-xl border border-border bg-card p-4" data-testid="status-endpoint-health"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Data coverage</p><p className="mt-1 text-sm font-semibold">{endpoints.filter(([, payload]) => Boolean(payload)).length} of {endpoints.length} provider endpoints returned data</p></div><Badge variant={Object.keys(errors).length ? "outline" : "success"}>{Object.keys(errors).length ? "Partial response" : "All endpoints healthy"}</Badge></div>{Object.keys(errors).length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{Object.entries(errors).map(([key, error]) => <div key={key} className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs"><CircleAlert className="h-4 w-4 shrink-0 text-destructive" /><span><strong>{formatLabel(key)}:</strong> {error}</span></div>)}</div>}<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{endpoints.map(([label, payload, key]) => <div key={key} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs"><span className={cn("h-1.5 w-1.5 rounded-full", payload ? "bg-accent" : "bg-destructive")} />{label}</div>)}</div></div>;
}

function ResultWorkspace({ result }: { result: RankTrackerResult }) {
  const details = payloadData(result.productDetails);
  const offers = payloadData(result.offers);
  const reviews = payloadData(result.reviews);
  const topReviews = payloadData(result.topReviews);
  const hasRank = result.currentRank !== null;
  const movedUp = result.rankChange !== null && result.rankChange > 0;
  const movement = result.rankChange === null ? null : Math.abs(result.rankChange);
  const rankText = hasRank ? `#${result.currentRank}` : "—";
  return <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-5" data-testid="section-rank-result">
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={cn("gap-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider", result.mode === "live" ? "border-accent/50 bg-accent/10 text-accent" : "border-secondary/60 bg-secondary/15")}>{result.mode === "live" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}{result.mode === "live" ? "Live marketplace data" : "Demo data"}</Badge><span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{result.marketplace} / {result.keyword || "ASIN lookup"}</span></div><h2 className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" data-testid="text-product-title">{result.productTitle || "Amazon product"}</h2><p className="mt-2 font-mono text-xs text-muted-foreground">{result.brand || "Brand unavailable"} <span className="px-2 text-border">/</span> ASIN {result.asin}</p></div><div className="text-left sm:text-right"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Last checked</p><p className="mt-1 text-sm font-semibold" data-testid="text-tracked-at">{formatTrackedAt(result.trackedAt)}</p></div></div>
    <EndpointHealth result={result} />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Organic rank" value={rankText} detail={hasRank ? "Lower is stronger" : "Not returned"} icon={BarChart3} accent={hasRank} testId="metric-current-rank" /><Metric label="Movement" value={movement === null ? "—" : `${movedUp ? "+" : "-"}${movement}`} detail={movement === null ? "No prior rank" : movedUp ? "Positions gained" : "Positions lost"} icon={movedUp ? ArrowUpRight : ArrowDownRight} accent={movedUp} testId="metric-rank-change" /><Metric label="Rating" value={result.rating ? `${result.rating.toFixed(1)} / 5` : "—"} detail="Customer average" icon={Star} testId="metric-rating" /><Metric label="Review count" value={result.reviewCount ? result.reviewCount.toLocaleString() : "—"} detail="Total ratings" icon={Users} testId="metric-review-count" /><Metric label="Current price" value={formatMoney(result.price, result.currency)} detail={result.currency || "Currency unavailable"} icon={Tag} testId="metric-price" /></div>
    <Tabs defaultValue="overview" className="w-full"><TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 sm:w-fit"><TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger><TabsTrigger value="listing" data-testid="tab-listing">Listing & rank</TabsTrigger><TabsTrigger value="offers" data-testid="tab-offers">Offers</TabsTrigger><TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger><TabsTrigger value="explorer" data-testid="tab-explorer">Field explorer</TabsTrigger></TabsList><TabsContent value="overview"><ProductOverview result={result} details={details} reviews={reviews} /></TabsContent><TabsContent value="listing"><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><Card className="border-border shadow-none"><CardHeader><div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /><CardTitle className="text-base">Visibility over time</CardTitle></div></CardHeader><CardContent className="pt-0"><div className="mb-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">{hasRank ? "Organic rank history" : "Rank history unavailable"}</span><span className="font-mono text-xs text-muted-foreground">{result.previousRank === null ? "No prior rank" : `Prior #${result.previousRank}`}</span></div><TrendLine result={result} /></CardContent></Card><div className="space-y-5"><ImageRail result={result} details={details} /><DetailList title="Product information" icon={PackageCheck} items={Object.entries(isObject(details.product_information) ? details.product_information : {}).slice(0, 8)} /></div></div></TabsContent><TabsContent value="offers"><div className="space-y-5"><DetailList title="Fulfillment & availability" icon={Truck} items={[["Availability", firstString(details, "product_availability")], ["Delivery price", firstString(details, "delivery_price")], ["Sales volume", firstString(details, "sales_volume")], ["Offer count", firstNumber(details, "product_num_offers")], ["Condition", firstString(details, "product_condition")]]} /><OffersPanel offers={offers} /></div></TabsContent><TabsContent value="reviews"><ReviewsPanel reviews={reviews} topReviews={topReviews} /></TabsContent><TabsContent value="explorer"><FieldExplorer result={result} /></TabsContent></Tabs>
  </motion.section>;
}

export default function RankTrackerPage() {
  const [result, setResult] = useState<RankTrackerResult | null>(null);
  const form = useForm<TrackerForm>({ defaultValues: { asin: "", keyword: "", marketplace: "US" } });
  const lookup = useLookupRankTracker();
  const marketplace = form.watch("marketplace");
  const selectedMarket = useMemo(() => marketplaces.find((item) => item.value === marketplace) ?? marketplaces[0], [marketplace]);
  useEffect(() => {
    document.title = "Amazon Product Intelligence | NumVerify";
    const description = "Read one Amazon ASIN with trustworthy product, rank, offer, and review intelligence.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", description);
  }, []);
  const onSubmit = (values: TrackerForm) => {
    const payload: RankTrackerInput = { asin: values.asin.trim().toUpperCase(), keyword: values.keyword.trim(), marketplace: values.marketplace };
    setResult(null);
    lookup.mutate({ data: payload }, { onSuccess: (data) => setResult(data) });
  };
  const loadExample = () => { form.reset(exampleForm); setResult(null); };
  const errorMessage = lookup.error instanceof Error ? lookup.error.message : "The marketplace intelligence request did not complete. Check the ASIN and try again.";
  return <div className="min-h-[100dvh] overflow-hidden bg-background">
    <main><section className="relative border-b border-border pb-14 pt-12 sm:pb-20 sm:pt-16"><div className="pointer-events-none absolute -right-40 -top-24 h-[520px] w-[520px] rounded-full bg-secondary/12 blur-3xl" /><div className="pointer-events-none absolute left-[7%] top-32 h-px w-[42%] bg-gradient-to-r from-transparent via-primary/35 to-transparent" /><div className="container relative mx-auto px-4"><div className="mx-auto max-w-6xl"><div className="grid gap-10 lg:grid-cols-[.76fr_1.24fr] lg:items-end"><div><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><Badge variant="outline" className="mb-6 gap-2 rounded-full border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[.17em] text-primary" data-testid="badge-rank-tracker"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> ASIN intelligence workspace</Badge><h1 className="max-w-xl font-display text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-6xl">One read.<br /><span className="text-primary">Better calls.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">A precise Amazon product read for the moment before you change content, retail, or media.</p></motion.div></div><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="rounded-2xl border border-border bg-card p-4 shadow-[0_22px_70px_hsl(var(--foreground)/.08)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="font-display text-lg font-semibold">Inspect an ASIN</p><p className="mt-1 text-xs text-muted-foreground">Pull listing, visibility, offer, and review context in one pass.</p></div><div className="hidden items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-accent sm:flex"><ShieldCheck className="h-3 w-3" /> Provider sourced</div></div><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-[.82fr_1.15fr_.8fr_auto] lg:items-end" data-testid="form-rank-lookup"><FormField control={form.control} name="asin" rules={{ required: "Enter an ASIN to continue", minLength: { value: 10, message: "ASINs are 10 characters" } }} render={({ field }) => <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">ASIN</FormLabel><FormControl><Input {...field} data-testid="input-asin" placeholder="B0C7KJ9L2M" className="mt-2 h-12 bg-background font-mono uppercase tracking-wide" /></FormControl><FormMessage data-testid="message-asin" /></FormItem>} /><FormField control={form.control} name="keyword" render={({ field }) => <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Search term <span className="normal-case tracking-normal">(optional)</span></FormLabel><FormControl><Input {...field} data-testid="input-keyword" placeholder="collagen peptides" className="mt-2 h-12 bg-background" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="marketplace" render={({ field }) => <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Marketplace</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger data-testid="select-marketplace" className="mt-2 h-12 bg-background"><SelectValue placeholder="Choose a market" /></SelectTrigger></FormControl><SelectContent>{marketplaces.map((item) => <SelectItem key={item.value} value={item.value} data-testid={`option-marketplace-${item.value}`}>{item.value} · {item.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} /><Button type="submit" size="lg" disabled={lookup.isPending} className="h-12 gap-2 px-6" data-testid="button-check-rank">{lookup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{lookup.isPending ? "Reading..." : "Read ASIN"}</Button></form></Form><div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5 text-primary" /> {selectedMarket.domain} · {selectedMarket.label}</p><button type="button" onClick={loadExample} className="flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-foreground" data-testid="button-load-example">Load a sample ASIN <ArrowRight className="h-3.5 w-3.5" /></button></div></motion.div></div>
          {lookup.isPending && <div className="mt-8 grid gap-4 sm:grid-cols-3" data-testid="loading-rank-result">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-border bg-muted/50" />)}</div>}
          {lookup.isError && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm" data-testid="status-rank-error"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /><div><p className="font-semibold">We could not complete that read.</p><p className="mt-1 text-muted-foreground">{errorMessage}</p><button type="button" onClick={form.handleSubmit(onSubmit)} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-destructive hover:underline" data-testid="button-retry-lookup"><RefreshCw className="h-3.5 w-3.5" /> Retry lookup</button></div></motion.div>}
          {result ? <ResultWorkspace result={result} /> : !lookup.isPending && !lookup.isError ? <div className="mt-10 grid gap-4 md:grid-cols-3" data-testid="empty-rank-result">{[{ icon: Database, title: "One source of truth", copy: "Product, rank, offer, and review context aligned to one ASIN." }, { icon: Clock3, title: "Operator speed", copy: "A focused read for the five minutes before a high-cost marketplace change." }, { icon: ShieldCheck, title: "Honest coverage", copy: "Live, demo, partial, and unavailable data are clearly labeled." }].map((item) => <div key={item.title} className="rounded-xl border border-border bg-card/60 p-5 transition-transform duration-300 hover:-translate-y-1"><item.icon className="h-5 w-5 text-primary" /><p className="mt-4 font-display font-semibold">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</p></div>)}</div> : null}
        </div></div></section><section className="border-b border-border bg-muted/25 py-14 sm:py-18"><div className="container mx-auto grid gap-10 px-4 md:grid-cols-[.75fr_1.25fr] md:items-center"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">The operator lens</p><h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight sm:text-4xl">Context turns a rank into a decision.</h2></div><div className="grid gap-5 sm:grid-cols-2">{[{ number: "01", title: "See the shelf", copy: "Title, images, bullets, price, delivery, and buy box in one listing readout." }, { number: "02", title: "Separate signal", copy: "Rank movement sits beside rating depth, review shape, and offer pressure." }, { number: "03", title: "Inspect the source", copy: "Open the raw provider fields whenever the summary needs a closer look." }, { number: "04", title: "Move with confidence", copy: "Make the call on content, retail, or media with fewer unknowns." }].map((item) => <div key={item.number} className="border-t border-border pt-4"><span className="font-mono text-xs text-secondary">{item.number}</span><p className="mt-2 font-display font-semibold">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</p></div>)}</div></div></section><section className="bg-primary py-14 text-primary-foreground sm:py-18"><div className="container mx-auto flex flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary-foreground/65">Need a deeper operating system?</p><h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight">NumVerify connects marketplace evidence to the decisions that move margin.</h2></div><Button asChild variant="secondary" size="lg" className="w-fit shrink-0 gap-2"><Link href="/contact" data-testid="link-rank-contact">Talk to the team <ExternalLink className="h-4 w-4" /></Link></Button></div></section></main>
  </div>;
}