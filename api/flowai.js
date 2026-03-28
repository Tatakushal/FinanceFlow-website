const { runFlowAI } = require("../server/flowai-core");

function parseLooseJson(text) {
  const variants = [
    text,
    text.replace(/^\uFEFF/, ""),
    text.replace(/^'+|'+$/g, ""),
    text.replace(/^"+|"+$/g, "")
  ];

  for (const candidate of variants) {
    try {
      return JSON.parse(candidate);
    } catch (_err) {}
  }

  return null;
}

function parseFormEncoded(text) {
  const params = new URLSearchParams(text);
  if (![...params.keys()].length) {
    return null;
  }

  const message = params.get("message");
  const profileRaw = params.get("profile");
  if (!message && !profileRaw) {
    return null;
  }

  let profile = {};
  if (profileRaw) {
    const parsedProfile = parseLooseJson(profileRaw);
    profile = parsedProfile && typeof parsedProfile === "object" ? parsedProfile : {};
  }

  return { message: message || "", profile };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk.toString("utf8");
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large."));
      }
    });

    req.on("end", () => {
      const trimmed = raw.trim();
      if (!trimmed) {
        resolve({});
        return;
      }

      const parsedJson = parseLooseJson(trimmed);
      if (parsedJson && typeof parsedJson === "object") {
        resolve(parsedJson);
        return;
      }

      const parsedForm = parseFormEncoded(trimmed);
      if (parsedForm && typeof parsedForm === "object") {
        resolve(parsedForm);
        return;
      }

      reject(new Error(`Request body is not valid JSON. Raw: ${trimmed.slice(0, 180)}`));
    });

    req.on("error", () => {
      reject(new Error("Unable to read request body."));
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const result = await runFlowAI(body);
    return res.status(200).json(result);
  } catch (err) {
    console.error("/api/flowai error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const isClientInputError = /not valid json|too large|unable to read request body/i.test(message);

    return res.status(isClientInputError ? 400 : 500).json({
      error: isClientInputError ? "Invalid request payload." : "Unable to process FlowAI request.",
      details: message
    });
  }
};
