const crypto = require("crypto");

const MAX_BODY_BYTES = 150_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_COUNT = 25;

// Prevent memory leak by capping map size in serverless
const MAX_RATE_ENTRIES = 5000; 

const REQUESTS_BY_KEY = globalThis.__ffRateLimitMap || new Map();
globalThis.__ffRateLimitMap = REQUESTS_BY_KEY;

function setHeader(target, key, value) {
  if (!target) return;

  if (typeof target.setHeader === "function") {
    target.setHeader(key, value);
    return;
  }

  if (typeof target.set === "function") {
    target.set(key, value);
    return;
  }

  try {
    target[key] = value;
  } catch (_err) {
    // ignore
  }
}

function setSecurityHeaders(resOrHeadersObj) {
  setHeader(resOrHeadersObj, "Cache-Control", "no-store");
  setHeader(resOrHeadersObj, "Pragma", "no-cache");
  setHeader(resOrHeadersObj, "X-Content-Type-Options", "nosniff");
  setHeader(resOrHeadersObj, "X-Frame-Options", "DENY");
}

function getClientIp(reqHeaders, socketRemoteAddress) {
  // Respect Vercel or Netlify trusted proxy headers first
  const vercelIp = String(reqHeaders["x-vercel-forwarded-for"] || "").trim();
  if (vercelIp) return vercelIp.split(",")[0].trim();
  
  const netlifyIp = String(reqHeaders["x-nf-client-connection-ip"] || "").trim();
  if (netlifyIp) return netlifyIp;

  // Fallback to X-Forwarded-For, but take the *last* IP (added by the nearest trusted proxy)
  // to prevent simple client-side spoofing if they append multiple IPs.
  const xff = String(reqHeaders["x-forwarded-for"] || "").trim();
  if (xff) {
    const parts = xff.split(",");
    return parts[parts.length - 1].trim(); 
  }
  
  const xri = String(reqHeaders["x-real-ip"] || "").trim();
  if (xri) return xri;
  
  return String(socketRemoteAddress || "unknown");
}

function getRateKey(reqHeaders, socketRemoteAddress) {
  const ip = getClientIp(reqHeaders, socketRemoteAddress);
  const ua = String(reqHeaders["user-agent"] || "");
  const uaHash = crypto.createHash("sha1").update(ua).digest("hex").slice(0, 10);
  return `${ip}:${uaHash}`;
}

function enforceRateLimit(reqHeaders, socketRemoteAddress) {
  const now = Date.now();

  // Lazy cleanup to prevent memory leak
  if (REQUESTS_BY_KEY.size > MAX_RATE_ENTRIES) {
    for (const [k, v] of REQUESTS_BY_KEY.entries()) {
      if (now > v.resetAt) REQUESTS_BY_KEY.delete(k);
    }
  }

  const key = getRateKey(reqHeaders, socketRemoteAddress);
  const current = REQUESTS_BY_KEY.get(key);
  
  if (!current || now > current.resetAt) {
    REQUESTS_BY_KEY.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }

  current.count += 1;
  REQUESTS_BY_KEY.set(key, current);
  if (current.count <= RATE_LIMIT_COUNT) return { ok: true, retryAfterSec: 0 };

  const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return { ok: false, retryAfterSec };
}

function isOriginAllowed(reqHeaders) {
  const allowNoOrigin = String(process.env.FLOWAI_ALLOW_NO_ORIGIN || "").toLowerCase() === "true";
  const origin = String(reqHeaders.origin || "").trim().toLowerCase();
  
  const allowedOriginList = String(process.env.FLOWAI_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!origin) return allowNoOrigin;

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();

    // Allow same-origin by comparing against request Host / X-Forwarded-Host
    const reqHostRaw = String(reqHeaders["x-forwarded-host"] || reqHeaders.host || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const reqHost = reqHostRaw.split(":")[0]; // strip port if present
    if (reqHost && host === reqHost) return true;

    // Exact allow-list entries (can be full origin, host, or host suffix)
    if (allowedOriginList.length) {
      if (allowedOriginList.includes(origin)) return true;
      if (allowedOriginList.includes(host)) return true;
      if (allowedOriginList.some((suffix) => suffix.startsWith(".") && (host === suffix.slice(1) || host.endsWith(suffix)))) {
        return true;
      }
    }

    // Common trusted hosts (Vercel/Netlify + local dev)
    const allowedSuffixes = ["vercel.app", "netlify.app"];
    if (allowedSuffixes.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
      return true;
    }
    if (host === "localhost" || host === "127.0.0.1") return true;
  } catch (err) {
      return false;
  }

  return false;
}

function validatePayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid generic JSON object payload.");
  }

  const message = String(body?.message || "").trim();
  if (!message) throw new Error("Message is required.");
  if (message.length > 1200) throw new Error("Message too long.");

  // Extremely strict profile validation to prevent injection of 'role' or deep objects
  if (body?.profile !== undefined) {
    if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) {
      throw new Error("Profile must be an exact object.");
    }
    const profileBytes = Buffer.byteLength(JSON.stringify(body.profile), "utf8");
    if (profileBytes > 100_000) throw new Error("Profile payload too large.");
    
    // Disallow overriding critical keys explicitly
    if ("role" in body.profile || "admin" in body.profile) {
        throw new Error("Unsafe keys detected in user profile payload.");
    }
  }

  if (body?.history !== undefined) {
    if (!Array.isArray(body.history)) throw new Error("History must be an array.");
    if (body.history.length > 15) throw new Error("History array too long.");
  }
}

module.exports = {
  setSecurityHeaders,
  enforceRateLimit,
  isOriginAllowed,
  validatePayload,
  MAX_BODY_BYTES
};
