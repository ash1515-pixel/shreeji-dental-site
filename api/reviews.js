const REVIEWS_BLOB_URL =
  process.env.REVIEWS_BLOB_URL || "https://jsonblob.com/api/jsonBlob/019d33ad-481f-71ee-bc8f-59340a2f9377";

const MAX_REVIEWS = 120;
const NAME_MAX = 60;
const TEXT_MAX = 500;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const postBuckets = new Map();

function cleanValue(value, maxLen) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function normalizeReview(review) {
  return {
    id: cleanValue(review.id, 80) || `rvw-${Date.now()}`,
    name: cleanValue(review.name, NAME_MAX) || "Anonymous",
    text: cleanValue(review.text, TEXT_MAX),
    createdAt: new Date(review.createdAt || Date.now()).toISOString()
  };
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = postBuckets.get(ip) || [];
  const validHits = bucket.filter((stamp) => now - stamp < RATE_WINDOW_MS);

  if (validHits.length >= RATE_LIMIT) {
    postBuckets.set(ip, validHits);
    return true;
  }

  validHits.push(now);
  postBuckets.set(ip, validHits);
  return false;
}

async function readStore() {
  const response = await fetch(REVIEWS_BLOB_URL, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (response.status === 404) {
    return { reviews: [], etag: null };
  }

  if (!response.ok) {
    throw new Error(`Unable to read reviews store (${response.status})`);
  }

  const payload = await response.json().catch(() => ({ reviews: [] }));
  const reviews = Array.isArray(payload.reviews) ? payload.reviews.map(normalizeReview) : [];
  const etag = response.headers.get("etag");
  return { reviews, etag };
}

async function writeStore(reviews, etag) {
  const headers = { "content-type": "application/json" };
  if (etag) headers["if-match"] = etag;

  const response = await fetch(REVIEWS_BLOB_URL, {
    method: "PUT",
    headers,
    body: JSON.stringify({ reviews })
  });

  return response;
}

function sortReviews(reviews) {
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      const { reviews } = await readStore();
      return res.status(200).json({ reviews: sortReviews(reviews).slice(0, MAX_REVIEWS) });
    } catch (error) {
      return res.status(500).json({ error: "Could not load reviews." });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many review requests. Please try again later." });
  }

  let payload = {};
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (_error) {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const name = cleanValue(payload.name, NAME_MAX) || "Anonymous";
  const text = cleanValue(payload.text, TEXT_MAX);

  if (!text || text.length < 5) {
    return res.status(400).json({ error: "Please write at least 5 characters in review." });
  }

  const newReview = normalizeReview({
    id: `rvw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    text,
    createdAt: new Date().toISOString()
  });

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { reviews, etag } = await readStore();
      const nextReviews = sortReviews([newReview, ...reviews.filter((item) => item.id !== newReview.id)]).slice(
        0,
        MAX_REVIEWS
      );
      const writeResponse = await writeStore(nextReviews, etag);

      if (writeResponse.status === 412) {
        continue;
      }

      if (!writeResponse.ok) {
        throw new Error(`Unable to save review (${writeResponse.status})`);
      }

      return res.status(201).json({ review: newReview, reviews: nextReviews });
    }
    return res.status(409).json({ error: "Review save conflict. Please submit once again." });
  } catch (error) {
    return res.status(500).json({ error: "Could not save review right now." });
  }
}
