import { Router, type IRouter } from "express";
import { LookupRankTrackerBody } from "@workspace/api-zod";

const router: IRouter = Router();

const demoCatalog: Record<string, {
  productTitle: string;
  brand: string;
  imageUrl: string | null;
  currentRank: number;
  previousRank: number;
  rating: number;
  reviewCount: number;
  price: number;
}> = {
  B0C7Q2L8M4: {
    productTitle: "Hydrolyzed Collagen Peptides Powder, Unflavored",
    brand: "Luminary Wellness",
    imageUrl: null,
    currentRank: 3,
    previousRank: 7,
    rating: 4.6,
    reviewCount: 2841,
    price: 29.99,
  },
  B0D9MAGNES: {
    productTitle: "Magnesium Glycinate 400mg Capsules",
    brand: "Apex Naturals",
    imageUrl: null,
    currentRank: 11,
    previousRank: 16,
    rating: 4.5,
    reviewCount: 967,
    price: 21.95,
  },
  B0TRAILKIT: {
    productTitle: "Insulated Stainless Steel Water Bottle, 32 oz",
    brand: "TrailForge",
    imageUrl: null,
    currentRank: 24,
    previousRank: 31,
    rating: 4.7,
    reviewCount: 4120,
    price: 34.0,
  },
};

function makeTrend(currentRank: number, previousRank: number) {
  const steps = 7;
  const change = previousRank - currentRank;
  return Array.from({ length: steps }, (_, index) => {
    const progress = index / (steps - 1);
    const wobble = index === 2 ? 2 : index === 4 ? -1 : 0;
    return {
      date: new Date(Date.now() - (steps - 1 - index) * 86400000).toISOString().slice(0, 10),
      rank: Math.max(1, Math.round(previousRank - change * progress + wobble)),
    };
  });
}

function resultFromProduct(
  input: { asin: string; keyword: string; marketplace: string },
  product: Omit<typeof demoCatalog[string], "currentRank" | "previousRank"> & {
    currentRank: number | null;
    previousRank: number | null;
  },
  mode: "demo" | "live",
) {
  const currentRank = product.currentRank;
  const previousRank = product.previousRank;
  const hasRankHistory = currentRank !== null && previousRank !== null;
  return {
    mode,
    asin: input.asin,
    keyword: input.keyword,
    marketplace: input.marketplace,
    productTitle: product.productTitle,
    brand: product.brand,
    imageUrl: product.imageUrl,
    currentRank,
    previousRank,
    rankChange: hasRankHistory ? previousRank - currentRank : null,
    rating: product.rating,
    reviewCount: product.reviewCount,
    price: product.price,
    currency: input.marketplace === "UK" ? "GBP" : input.marketplace === "DE" || input.marketplace === "FR" || input.marketplace === "IT" || input.marketplace === "ES" ? "EUR" : "USD",
    trackedAt: new Date().toISOString(),
    trend: hasRankHistory ? makeTrend(currentRank, previousRank) : [],
  };
}

router.post("/rank-tracker/lookup", async (req, res): Promise<void> => {
  const parsed = LookupRankTrackerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid ASIN, keyword, and marketplace." });
    return;
  }

  const input = {
    asin: parsed.data.asin.toUpperCase(),
    keyword: parsed.data.keyword.trim(),
    marketplace: parsed.data.marketplace,
  };

  const rapidApiUrl = process.env.RAPIDAPI_RANK_TRACKER_URL;
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST;

  const isKnownDemoProduct = Boolean(demoCatalog[input.asin]);
  if (rapidApiUrl && rapidApiKey && rapidApiHost && !isKnownDemoProduct) {
    try {
      const target = new URL(rapidApiUrl);
      target.searchParams.set("asin", input.asin);
      target.searchParams.set("keyword", input.keyword);
      target.searchParams.set("country", input.marketplace);
      const providerResponse = await fetch(target, {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost,
        },
      });
      if (!providerResponse.ok) {
        req.log.warn({ status: providerResponse.status }, "RapidAPI rank tracker request failed");
        res.status(502).json({ error: "The live Amazon rank provider is temporarily unavailable." });
        return;
      }
      const providerPayload = await providerResponse.json() as Record<string, unknown>;
      const productData = providerPayload.data && typeof providerPayload.data === "object"
        ? providerPayload.data as Record<string, unknown>
        : providerPayload;
      const readString = (...keys: string[]) => keys
        .map((key) => productData[key])
        .find((value): value is string => typeof value === "string" && value.trim().length > 0);
      const readNumber = (...keys: string[]) => {
        for (const key of keys) {
          const value = productData[key];
          if (typeof value === "number" && Number.isFinite(value)) return value;
          if (typeof value === "string") {
            const parsed = Number(value.replace(/[^0-9.-]/g, ""));
            if (Number.isFinite(parsed)) return parsed;
          }
        }
        return undefined;
      };
      const bestsellerRanks = productData.product_bestseller_rank;
      const firstBestsellerRank = Array.isArray(bestsellerRanks)
        ? bestsellerRanks.find((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
        : bestsellerRanks && typeof bestsellerRanks === "object"
          ? bestsellerRanks as Record<string, unknown>
          : undefined;
      const bestsellerRank = firstBestsellerRank && typeof firstBestsellerRank === "object"
        ? (() => {
            const value = firstBestsellerRank.rank;
            if (typeof value === "number" && Number.isFinite(value)) return value;
            if (typeof value === "string") {
              const parsed = Number(value.replace(/[^0-9.-]/g, ""));
              if (Number.isFinite(parsed)) return parsed;
            }
            return undefined;
          })()
        : undefined;
      const productTitle = readString("productTitle", "product_title", "title");
      const currentRank = readNumber("currentRank", "current_rank", "rank", "sales_rank") ?? bestsellerRank ?? null;
      if (!productTitle) {
        res.status(502).json({ error: "The live provider returned an unsupported response format." });
        return;
      }
      const previousRank = readNumber("previousRank", "previous_rank") ?? (currentRank === null ? null : currentRank);
      res.json(resultFromProduct(input, {
        productTitle,
        brand: readString("brand", "product_brand") ?? "Unknown brand",
        imageUrl: readString("imageUrl", "product_photo", "product_image", "image") ?? null,
        currentRank,
        previousRank,
        rating: readNumber("rating", "product_star_rating") ?? 0,
        reviewCount: readNumber("reviewCount", "product_num_reviews", "product_num_ratings") ?? 0,
        price: readNumber("price", "product_price") ?? 0,
      }, "live"));
      return;
    } catch (error) {
      req.log.error({ error }, "RapidAPI rank tracker request errored");
      res.status(502).json({ error: "The live Amazon rank provider is temporarily unavailable." });
      return;
    }
  }

  const demoProduct = demoCatalog[input.asin] ?? {
    productTitle: `${input.keyword.replace(/\b\w/g, (letter: string) => letter.toUpperCase())} — Demo Listing`,
    brand: "NumVerify Demo Catalog",
    imageUrl: null,
    currentRank: 18,
    previousRank: 26,
    rating: 4.5,
    reviewCount: 624,
    price: 24.99,
  };
  res.json(resultFromProduct(input, demoProduct, "demo"));
});

export default router;