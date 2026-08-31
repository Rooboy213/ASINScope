import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  CircleAlert,
  Clock3,
  Database,
  ExternalLink,
  Globe2,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
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
import { cn } from "@/lib/utils";

type TrackerForm = {
  asin: string;
  keyword: string;
  marketplace: RankTrackerInputMarketplace;
};

const marketplaces: Array<{ value: RankTrackerInputMarketplace; label: string; flag: string }> = [
  { value: "US", label: "United States", flag: "amazon.com" },
  { value: "CA", label: "Canada", flag: "amazon.ca" },
  { value: "UK", label: "United Kingdom", flag: "amazon.co.uk" },
  { value: "DE", label: "Germany", flag: "amazon.de" },
  { value: "FR", label: "France", flag: "amazon.fr" },
  { value: "IT", label: "Italy", flag: "amazon.it" },
  { value: "ES", label: "Spain", flag: "amazon.es" },
  { value: "JP", label: "Japan", flag: "amazon.co.jp" },
  { value: "AU", label: "Australia", flag: "amazon.com.au" },
  { value: "IN", label: "India", flag: "amazon.in" },
];

const exampleForm: TrackerForm = {
  asin: "B0C7KJ9L2M",
  keyword: "wireless charging stand",
  marketplace: "US",
};

function formatTrackedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function TrendLine({ result }: { result: RankTrackerResult }) {
  const points = result.trend ?? [];
  const values = points.map((point) => point.rank);
  if (values.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground" data-testid="empty-trend">
        Not enough history to plot a trend yet.
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const linePoints = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 10 + ((value - min) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-border bg-[linear-gradient(180deg,hsl(var(--secondary)/.10),transparent)] p-3" data-testid="chart-rank-trend">
      <div className="pointer-events-none absolute inset-x-3 top-3 bottom-3 flex flex-col justify-between">
        {[0, 1, 2].map((line) => (
          <div key={line} className="border-t border-dashed border-border/70" />
        ))}
      </div>
      <svg viewBox="0 0 100 92" preserveAspectRatio="none" className="relative h-full w-full" aria-label="Organic rank trend chart">
        <defs>
          <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity=".32" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,92 ${linePoints} 100,92`} fill="url(#trend-fill)" />
        <polyline points={linePoints} fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
        {values.map((value, index) => {
          const x = (index / (values.length - 1)) * 100;
          const y = 10 + ((value - min) / range) * 72;
          return <circle key={`${value}-${index}`} cx={x} cy={y} r="1.7" fill="hsl(var(--secondary))" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div className="absolute inset-x-3 bottom-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: RankTrackerResult }) {
  const movedUp = result.rankChange > 0;
  const movement = Math.abs(result.rankChange);
  const rankLabel = movement === 0 ? "Holding steady" : movedUp ? `${movement} positions up` : `${movement} positions down`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_hsl(var(--foreground)/.08)]"
      data-testid="section-rank-result"
    >
      <div className="flex flex-col gap-4 border-b border-border bg-muted/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Organic rank snapshot</p>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
              {result.marketplace} / {result.keyword}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "w-fit gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider",
            result.mode === "live" ? "border-accent/50 bg-accent/10 text-accent" : "border-secondary/60 bg-secondary/15 text-foreground",
          )}
          data-testid="status-result-mode"
        >
          {result.mode === "live" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {result.mode === "live" ? "Live marketplace data" : "Demo data"}
        </Badge>
      </div>

      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted font-display text-2xl font-bold text-primary">
              {result.brand.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{result.brand}</p>
              <h2 className="font-display text-xl font-semibold leading-tight" data-testid="text-product-title">{result.productTitle}</h2>
              <p className="mt-2 font-mono text-xs text-muted-foreground">ASIN {result.asin}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            <div className="bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current rank</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary" data-testid="text-current-rank">#{result.currentRank}</p>
            </div>
            <div className="bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Movement</p>
              <p className={cn("mt-2 flex items-center gap-1 font-display text-lg font-bold", movedUp ? "text-accent" : "text-destructive")} data-testid="text-rank-change">
                {movement === 0 ? <ArrowRight className="h-4 w-4" /> : movedUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {rankLabel}
              </p>
            </div>
            <div className="bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rating</p>
              <p className="mt-2 font-display text-lg font-bold" data-testid="text-rating">{result.rating.toFixed(1)} <span className="text-secondary">/ 5</span></p>
            </div>
            <div className="bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reviews</p>
              <p className="mt-2 font-display text-lg font-bold" data-testid="text-review-count">{result.reviewCount.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display font-semibold">14-day visibility</p>
                <p className="text-xs text-muted-foreground">Lower rank is closer to the top of search.</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">#{result.previousRank} prior</span>
            </div>
            <TrendLine result={result} />
          </div>
        </div>

        <aside className="flex flex-col justify-between rounded-xl border border-border bg-muted/30 p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Listing context</p>
            <dl className="mt-5 space-y-4">
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <dt className="text-sm text-muted-foreground">Current price</dt>
                <dd className="font-display text-xl font-semibold" data-testid="text-price">{new Intl.NumberFormat("en", { style: "currency", currency: result.currency }).format(result.price)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <dt className="text-sm text-muted-foreground">Tracked at</dt>
                <dd className="font-mono text-xs" data-testid="text-tracked-at">{formatTrackedAt(result.trackedAt)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Previous rank</dt>
                <dd className="font-mono text-sm">#{result.previousRank}</dd>
              </div>
            </dl>
          </div>
          <div className="mt-8 rounded-lg border border-secondary/30 bg-secondary/10 p-4">
            <p className="font-display text-sm font-semibold">What this says</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {movedUp
                ? "Your listing is gaining visibility for this term. Protect the position before competitors close the gap."
                : movement === 0
                  ? "Your listing is stable. Look for conversion and review velocity gains to create the next lift."
                  : "Visibility has softened. Check your offer, retail readiness, and keyword relevance before increasing spend."}
            </p>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

export default function RankTrackerPage() {
  const [result, setResult] = useState<RankTrackerResult | null>(null);
  const form = useForm<TrackerForm>({ defaultValues: { asin: "", keyword: "", marketplace: "US" } });
  const lookup = useLookupRankTracker();
  const marketplace = form.watch("marketplace");

  const selectedMarket = useMemo(
    () => marketplaces.find((item) => item.value === marketplace) ?? marketplaces[0],
    [marketplace],
  );

  useEffect(() => {
    document.title = "Amazon Rank Tracker | NumVerify";
    const description = "Check an Amazon product's organic rank, movement, and marketplace context with NumVerify.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  const onSubmit = (values: TrackerForm) => {
    const payload: RankTrackerInput = {
      asin: values.asin.trim().toUpperCase(),
      keyword: values.keyword.trim(),
      marketplace: values.marketplace,
    };
    setResult(null);
    lookup.mutate({ data: payload }, { onSuccess: (data) => setResult(data) });
  };

  const loadExample = () => {
    form.reset(exampleForm);
    setResult(null);
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-background">
      <section className="relative border-b border-border bg-background pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="pointer-events-none absolute -right-32 top-0 h-[480px] w-[480px] rounded-full bg-secondary/15 blur-3xl" />
        <div className="pointer-events-none absolute left-[8%] top-36 h-px w-[40%] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
              <Badge variant="outline" className="mb-6 gap-2 rounded-full border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[.17em] text-primary" data-testid="badge-rank-tracker">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Free marketplace signal
              </Badge>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[.98] tracking-[-.04em] sm:text-6xl lg:text-7xl">
                Stop guessing where your product{" "}
                <span className="relative inline-block text-primary">
                  ranks.
                  <span className="absolute -bottom-1 left-0 h-1 w-2/3 rounded-full bg-secondary sm:-bottom-2" />
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Get a focused read on organic visibility, movement, and listing context. One query to make the next Amazon decision less subjective.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .5, delay: .12 }}
              className="mt-10 rounded-2xl border border-border bg-card p-4 shadow-[0_22px_70px_hsl(var(--foreground)/.08)] sm:p-6"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 lg:grid-cols-[1fr_1.15fr_.78fr_auto] lg:items-end" data-testid="form-rank-lookup">
                  <FormField
                    control={form.control}
                    name="asin"
                    rules={{
                      required: "Enter an ASIN to continue",
                      minLength: { value: 10, message: "ASINs are 10 characters" },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">ASIN</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-asin" placeholder="B0C7KJ9L2M" className="mt-2 h-12 bg-background font-mono uppercase tracking-wide" />
                        </FormControl>
                        <FormMessage data-testid="message-asin" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keyword"
                    rules={{ required: "Enter a keyword to check" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Search term</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-keyword" placeholder="wireless charging stand" className="mt-2 h-12 bg-background" />
                        </FormControl>
                        <FormMessage data-testid="message-keyword" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marketplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Marketplace</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-marketplace" className="mt-2 h-12 bg-background">
                              <SelectValue placeholder="Choose a market" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {marketplaces.map((item) => (
                              <SelectItem key={item.value} value={item.value} data-testid={`option-marketplace-${item.value}`}>
                                {item.value} · {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" disabled={lookup.isPending} className="h-12 gap-2 px-6" data-testid="button-check-rank">
                    {lookup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {lookup.isPending ? "Checking…" : "Check rank"}
                  </Button>
                </form>
              </Form>
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5 text-primary" /> Checking {selectedMarket.flag} marketplace signals</p>
                <button type="button" onClick={loadExample} className="flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-foreground" data-testid="button-load-example">
                  Try an example query <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>

            {lookup.isPending && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3" data-testid="loading-rank-result">
                {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-border bg-muted/50" />)}
              </div>
            )}

            {lookup.isError && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm" data-testid="status-rank-error">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold">We could not complete that lookup.</p>
                  <p className="mt-1 text-muted-foreground">Check the ASIN and try again. If the marketplace is having a quiet moment, retry in a few seconds.</p>
                </div>
              </motion.div>
            )}

            {result ? (
              <div className="mt-8">
                <ResultPanel result={result} />
                <p className="mt-4 flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground" data-testid="text-result-disclaimer">
                  {result.mode === "live" ? <ShieldCheck className="h-3.5 w-3.5 text-accent" /> : <Sparkles className="h-3.5 w-3.5 text-secondary" />}
                  {result.mode === "live" ? "Live result · sourced from marketplace data" : "Demo result · illustrative marketplace data"}
                </p>
              </div>
            ) : !lookup.isPending && !lookup.isError ? (
              <div className="mt-8 grid gap-4 md:grid-cols-3" data-testid="empty-rank-result">
                {[
                  { icon: Database, title: "One clean signal", copy: "Current rank, movement, and the context that explains it." },
                  { icon: Clock3, title: "Built for operators", copy: "A fast answer when a dashboard is too much and a hunch is not enough." },
                  { icon: ShieldCheck, title: "Clear provenance", copy: "Every result tells you whether it is live or illustrative demo data." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-card/55 p-5 transition-transform duration-300 hover:-translate-y-1">
                    <item.icon className="h-5 w-5 text-primary" />
                    <p className="mt-4 font-display font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25 py-16 sm:py-20">
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">A useful first move</p>
            <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight sm:text-4xl">The rank is a symptom. The pattern is the opportunity.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { number: "01", title: "Find the drift", copy: "Spot a meaningful move before it becomes an expensive surprise." },
              { number: "02", title: "Add the why", copy: "Pair rank movement with review velocity, price, and listing readiness." },
              { number: "03", title: "Make the call", copy: "Decide whether the next dollar belongs in content, retail, or media." },
              { number: "04", title: "Keep a record", copy: "Turn a one-off check into an operating rhythm your team can trust." },
            ].map((item) => (
              <div key={item.number} className="border-t border-border pt-4">
                <span className="font-mono text-xs text-secondary">{item.number}</span>
                <p className="mt-2 font-display font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground sm:py-18">
        <div className="container mx-auto flex flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary-foreground/65">Need more than a snapshot?</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight">NumVerify connects marketplace data to the decisions that move margin.</h2>
          </div>
          <Button asChild variant="secondary" size="lg" className="w-fit shrink-0 gap-2">
            <Link href="/contact" data-testid="link-rank-contact">Talk to the team <ExternalLink className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}