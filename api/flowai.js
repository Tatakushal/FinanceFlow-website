const { runFlowAI } = require("../server/flowai-core");
const {
  setSecurityHeaders,
  enforceRateLimit,
  isOriginAllowed,
  validatePayload,
  MAX_BODY_BYTES
} = require("../server/security");

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) return;
      raw += chunk.toString("utf8");
      if (raw.length > MAX_BODY_BYTES) {
        tooLarge = true;
        reject(new Error("Request payload exceeeds size limits."));
      }
    });

    req.on("end", () => {
      if (tooLarge) return;
      const trimmed = raw.trim();
      if (!trimmed) {
        reject(new Error("Empty request body."));
        return;
      }
      try {
        const parsed = JSON.parse(trimmed);
        resolve(parsed);
      } catch (_err) {
        reject(new Error("Invalid JSON struct."));
      }
    });

    req.on("error", () => reject(new Error("Network error during stream read.")));
  });
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const ctype = String(req.headers["content-type"] || "").toLowerCase();
  if (!ctype.includes("application/json")) {
    return res.status(415).json({ error: "Unsupported media." });
  }

  // Same-origin deployments
  if (!isOriginAllowed(req.headers)) {
     // Allow local development dynamically
     if (String(req.headers.origin || "").includes("localhost")) {
         // Pass
     } else {
        return res.status(403).json({ error: "Origin missing or untrusted." });
     }
  }

  const rate = enforceRateLimit(req.headers, req.socket?.remoteAddress);
  if (!rate.ok) {
    res.setHeader("Retry-After", String(rate.retryAfterSec));
    return res.status(429).json({ error: "Rate limit triggered. Pause further attempts." });
  }

  try {
    const body = await readJsonBody(req);
    validatePayload(body);
    const result = await runFlowAI(body);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Vercel route internal crash protection caught an error:", err.message);
    
    // Static Safe Error mapping
    const errMessage = err instanceof Error ? err.message : "Internal Error";
    if (errMessage.includes("size limits") || errMessage.includes("Empty") || errMessage.includes("Invalid") || errMessage.includes("required") || errMessage.includes("too long")) {
       return res.status(400).json({ error: errMessage });
    }

    // Never bubble up backend system strings like line errors, fetch failures to OpenAI, etc.
    return res.status(500).json({
      error: "Unable to process secure AI response."
    });
  }
};
