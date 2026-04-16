const { setSecurityHeaders, isOriginAllowed } = require("../server/security");

function pickEnv(key) {
  return String(process.env[key] || "").trim();
}

module.exports = function handler(req, res) {
  setSecurityHeaders(res);

  // CORS (only echoes for allowed origins)
  const origin = String(req.headers.origin || "");
  if (origin && isOriginAllowed(req.headers)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  }

  // This endpoint is intentionally non-sensitive (public config for the browser).
  // Still enforce origin checks when an Origin header is present.
  if (origin && !isOriginAllowed(req.headers)) {
    return res.status(403).json({ error: "Untrusted origin." });
  }

  const firebase = {
    apiKey: pickEnv("FIREBASE_API_KEY"),
    authDomain: pickEnv("FIREBASE_AUTH_DOMAIN"),
    projectId: pickEnv("FIREBASE_PROJECT_ID"),
    appId: pickEnv("FIREBASE_APP_ID"),
    storageBucket: pickEnv("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: pickEnv("FIREBASE_MESSAGING_SENDER_ID"),
    measurementId: pickEnv("FIREBASE_MEASUREMENT_ID")
  };

  const enabled =
    !!firebase.apiKey && !!firebase.authDomain && !!firebase.projectId && !!firebase.appId;

  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    cloudSync: {
      enabled,
      provider: enabled ? "firebase" : "none"
    },
    firebase: enabled ? firebase : null
  });
};
