import { Router, type IRouter } from "express";
import { LookupRankTrackerBody, LookupRankTrackerResponse } from "@workspace/api-zod";

const router: IRouter = Router();
type JsonObject = Record<string, unknown>;
type EndpointKey = "productDetails" | "offers" | "reviews" | "topReviews";

const endpointPaths: Record<EndpointKey, string> = {
  productDetails: "/product-details",
  offers: "/product-offers",
  reviews: "/product-reviews",
  topReviews: "/top-product-reviews",
};

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

function getData(payload: JsonObject | null): JsonObject {
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data as JsonObject;
  }
  return payload ?? {};
}

function readString(data: JsonObject, ...keys: string[]) {
  return keys
    .map((key) => data[key])
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function readNumber(data: JsonObject, ...keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function readNestedString(data: JsonObject, key: string, nestedKey: string) {
  const nested = data[key];
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) return undefined;
  const value = (nested as JsonObject)[nestedKey];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readRank(data: JsonObject) {
  const directRank = readNumber(data, "currentRank", "current_rank", "sales_rank", "rank", "bestseller_rank");
  if (directRank !== undefined) return directRank;

  const rankList = data.product_bestseller_rank;
  const rankEntry = Array.isArray(rankList)
    ? rankList.find((entry): entry is JsonObject => Boolean(entry && typeof entry === "object"))
    : rankList && typeof rankList === "object"
      ? rankList as JsonObject
      : undefined;
  return rankEntry ? readNumber(rankEntry, "rank", "value") : undefined;
}

function makePayload(input: { asin: string; marketplace: string }, data: JsonObject): JsonObject {
  return {
    status: "DEMO",
    request_id: `demo-${input.asin.toLowerCase()}`,
    parameters: { asin: input.asin, country: input.marketplace },
    data,
  };
}

function makeDemoPayloads(
  input: { asin: string; keyword: string; marketplace: string },
  product: typeof demoCatalog[string],
) {
  const baseData: JsonObject = {
    asin: input.asin,
    product_title: product.productTitle,
    product_price: product.price.toFixed(2),
    current_rank: product.currentRank,
    previous_rank: product.previousRank,
    product_original_price: null,
    delivery_price: "FREE",
    minimum_order_quantity: null,
    currency: input.marketplace === "UK" ? "GBP" : "USD",
    country: input.marketplace,
    domain: `www.amazon.${input.marketplace.toLowerCase()}`,
    product_byline: `${product.brand} Store`,
    product_byline_link: null,
    product_star_rating: product.rating.toFixed(1),
    product_num_ratings: product.reviewCount,
    product_url: `https://www.amazon.com/dp/${input.asin}`,
    product_photo: product.imageUrl,
    product_num_offers: 3,
    product_availability: "In Stock",
    product_condition: "New",
    is_best_seller: product.currentRank <= 10,
    is_amazon_choice: false,
    is_prime: true,
    main_buy_box: {
      title: "New",
      price: `$${product.price.toFixed(2)}`,
      seller: product.brand,
      seller_id: "demo-seller",
      seller_link: null,
      return_policy: "30-day returns",
    },
    buy_boxes: [],
    climate_pledge_friendly: false,
    sales_volume: "1K+ bought in past month",
    about_product: [
      "Built for consistent daily use.",
      "Designed around the needs of an active Amazon shopper.",
      "Ships quickly with a clear return policy.",
    ],
    product_description: `${product.productTitle} from ${product.brand}.`,
    product_information: {
      Brand: product.brand,
      "Item Condition": "New",
      "Product Category": "Health & Household",
    },
    rating_distribution: { "1": 2, "2": 3, "3": 7, "4": 22, "5": 66 },
    product_photos: product.imageUrl ? [product.imageUrl] : [],
    product_videos: [],
    user_uploaded_videos: [],
    has_video: false,
    product_details: { Brand: product.brand },
    category: { id: "demo", name: "Health & Household" },
    category_path: [{ id: "demo", name: "Health & Household", link: null }],
    product_variations_dimensions: [],
    product_variations: {},
    all_product_variations: {},
    has_aplus: false,
    aplus_text: null,
    aplus_images: [],
    has_brandstory: false,
    frequently_bought_together: [],
    related_products: [],
    landing_asin: input.asin,
    parent_asin: input.asin,
  };
  const reviews = [
    {
      review_id: "demo-review-1",
      review_title: "A dependable everyday product",
      review_comment: "The product arrived quickly and matched the listing.",
      review_star_rating: "5",
      review_link: null,
      review_author: "Demo shopper",
      review_author_avatar: null,
      review_images: [],
      review_video: null,
      review_date: new Date().toISOString().slice(0, 10),
      is_verified_purchase: true,
      helpful_vote_statement: "Helpful",
      reviewed_product_asin: input.asin,
      reviewed_product_url: `https://www.amazon.com/dp/${input.asin}`,
      reviewed_product_variant: {},
      is_vine: false,
    },
  ];
  return {
    productDetails: makePayload(input, { ...baseData, product_bestseller_rank: [{ category: "Demo category", rank: product.currentRank }] }),
    offers: makePayload(input, {
      asin: input.asin,
      product_offers: [
        { product_price: `$${product.price.toFixed(2)}`, product_condition: "New", ships_from: "Amazon", seller: product.brand, seller_star_rating: "4.8", currency: baseData.currency, delivery_price: "FREE", delivery_time: "Get it tomorrow" },
      ],
    }),
    reviews: makePayload(input, { asin: input.asin, country: input.marketplace, total_ratings: product.reviewCount, rating_distribution: baseData.rating_distribution, reviews }),
    topReviews: makePayload(input, { asin: input.asin, country: input.marketplace, rating_distribution: baseData.rating_distribution, reviews }),
  };
}

function summarizeProduct(
  input: { asin: string; keyword: string; marketplace: string },
  payload: JsonObject,
  mode: "demo" | "live",
  supportingPayloads: Partial<Record<EndpointKey, JsonObject | null>>,
  endpointErrors: Record<string, string>,
) {
  const data = getData(payload);
  const reviewData = getData(supportingPayloads.reviews ?? null);
  const currentRank = readRank(data);
  const previousRank = readNumber(data, "previousRank", "previous_rank") ?? null;
  const hasRankHistory = currentRank !== undefined && previousRank !== null;
  const rating = readNumber(data, "product_star_rating", "rating") ?? 0;
  const reviewCount = readNumber(data, "product_num_ratings", "product_num_reviews", "reviewCount")
    ?? readNumber(reviewData, "total_ratings")
    ?? 0;

  return {
    mode,
    asin: input.asin,
    keyword: input.keyword,
    marketplace: input.marketplace,
    productTitle: readString(data, "product_title", "productTitle", "title") ?? "Amazon product",
    brand: readString(data, "brand", "product_brand")
      ?? readNestedString(data, "product_details", "Brand")
      ?? readNestedString(data, "product_information", "Brand")
      ?? readString(data, "product_byline")
      ?? "Brand unavailable",
    imageUrl: readString(data, "product_photo", "imageUrl", "product_image", "image") ?? null,
    currentRank: currentRank ?? null,
    previousRank,
    rankChange: hasRankHistory ? previousRank - currentRank : null,
    rating,
    reviewCount,
    price: readNumber(data, "product_price", "price") ?? 0,
    currency: readString(data, "currency", "product_currency") ?? "USD",
    trackedAt: new Date().toISOString(),
    trend: hasRankHistory ? makeTrend(currentRank, previousRank) : [],
    productDetails: payload,
    offers: supportingPayloads.offers ?? null,
    reviews: supportingPayloads.reviews ?? null,
    topReviews: supportingPayloads.topReviews ?? null,
    endpointErrors,
  };
}

async function fetchEndpoint(
  path: string,
  input: { asin: string; marketplace: string },
): Promise<{ payload: JsonObject | null; error?: string }> {
  const host = process.env.RAPIDAPI_HOST ?? "real-time-amazon-data.p.rapidapi.com";
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return { payload: null, error: "RAPIDAPI_KEY is not configured." };

  const target = new URL(`https://${host}${path}`);
  target.searchParams.set("asin", input.asin);
  target.searchParams.set("country", input.marketplace);
  if (path === endpointPaths.reviews) target.searchParams.set("page", "1");

  const response = await fetch(target, {
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
  });
  if (!response.ok) return { payload: null, error: `Provider returned HTTP ${response.status}.` };
  const body = await response.json() as unknown;
  return {
    payload: body && typeof body === "object" && !Array.isArray(body) ? body as JsonObject : { data: body },
  };
}

router.post("/rank-tracker/lookup", async (req, res): Promise<void> => {
  const parsed = LookupRankTrackerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid ASIN and marketplace." });
    return;
  }

  const input = {
    asin: parsed.data.asin.trim().toUpperCase(),
    keyword: parsed.data.keyword?.trim() ?? "",
    marketplace: parsed.data.marketplace,
  };
  const isKnownDemoProduct = Boolean(demoCatalog[input.asin]);
  const hasRapidApi = Boolean(process.env.RAPIDAPI_KEY);

  if (hasRapidApi && !isKnownDemoProduct) {
    try {
      const entries = await Promise.all(
        (Object.entries(endpointPaths) as Array<[EndpointKey, string]>).map(async ([key, path]) => [key, await fetchEndpoint(path, input)] as const),
      );
      const fetched = Object.fromEntries(entries) as Record<EndpointKey, { payload: JsonObject | null; error?: string }>;
      if (!fetched.productDetails.payload) {
        req.log.warn({ error: fetched.productDetails.error }, "RapidAPI product details request failed");
        res.status(502).json({ error: "The live Amazon product details request failed. Check the ASIN and try again." });
        return;
      }
      const endpointErrors = Object.fromEntries(
        entries
          .filter(([key, result]) => key !== "productDetails" && result.error)
          .map(([key, result]) => [key, result.error as string]),
      );
      const response = summarizeProduct(
        input,
        fetched.productDetails.payload,
        "live",
        {
          offers: fetched.offers.payload,
          reviews: fetched.reviews.payload,
          topReviews: fetched.topReviews.payload,
        },
        endpointErrors,
      );
      res.json(LookupRankTrackerResponse.parse(response));
      return;
    } catch (error) {
      req.log.error({ error }, "RapidAPI product intelligence request errored");
      res.status(502).json({ error: "The live Amazon product intelligence request failed. Try again in a few seconds." });
      return;
    }
  }

  const demoProduct = demoCatalog[input.asin] ?? {
    productTitle: `${input.keyword.replace(/\b\w/g, (letter: string) => letter.toUpperCase()) || "Amazon"} — Demo Listing`,
    brand: "NumVerify Demo Catalog",
    imageUrl: null,
    currentRank: 18,
    previousRank: 26,
    rating: 4.5,
    reviewCount: 624,
    price: 24.99,
  };
  const demoPayloads = makeDemoPayloads(input, demoProduct);
  const response = summarizeProduct(
    input,
    demoPayloads.productDetails,
    "demo",
    {
      offers: demoPayloads.offers,
      reviews: demoPayloads.reviews,
      topReviews: demoPayloads.topReviews,
    },
    {},
  );
  res.json(LookupRankTrackerResponse.parse(response));
});

export default router;