const { runFlowAI } = require("../server/flowai-core");
const {
  setSecurityHeaders,
  enforceRateLimit,
  isOriginAllowed,
  validatePayload,
  MAX_BODY_BYTES
} = require("../server/security");

class ClientError extends Error {
  constructor(message) {
    super(message);
    this.name = "ClientError";
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    let finished = false;

    req.setTimeout?.(5000, () => {
      if (finished) return;
      finished = true;
      req.destroy?.();
      reject(new ClientError("Request timeout."));
    });

    req.on("data", (chunk) => {
      if (finished) return;

      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        finished = true;
        req.destroy?.();
        return reject(new ClientError("Request payload exceeds size limits."));
      }
      raw += chunk.toString("utf8");
    });

    req.on("end", () => {
      if (finished) return;
      const trimmed = raw.trim();
      if (!trimmed) {
        return reject(new ClientError("Empty request body."));
      }
      try {
        const parsed = JSON.parse(trimmed);
        resolve(parsed);
      } catch (_err) {
        reject(new ClientError("Invalid JSON structure."));
      }
    });

    req.on("error", () => reject(new ClientError("Network error during request.")));
  });
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  // CORS (only echoes for allowed origins)
  const origin = String(req.headers.origin || "");
  if (origin && isOriginAllowed(req.headers)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const ctype = String(req.headers["content-type"] || "").toLowerCase();
  if (!ctype.includes("application/json")) {
    return res.status(415).json({ error: "Unsupported media type." });
  }

  // Origin validation (same-origin + trusted hosting domains + optional env allow-list)
  if (!isOriginAllowed(req.headers)) {
    return res.status(403).json({ error: "Origin missing or untrusted." });
  }

  const rate = enforceRateLimit(req.headers, req.socket?.remoteAddress);
  if (!rate.ok) {
    res.setHeader("Retry-After", String(rate.retryAfterSec));
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  try {
    const body = await readJsonBody(req);
    validatePayload(body);

    const result = await Promise.race([
      runFlowAI(body),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI timeout")), 10_000)
      )
    ]);

    return res.status(200).json(result);
  } catch (err) {
    console.error({
      error: err?.message || String(err),
      ip: req.socket?.remoteAddress,
      path: req.url,
      time: new Date().toISOString()
    });

    if (err instanceof ClientError) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({
      error: "Unable to process request."
    });
  }
};
