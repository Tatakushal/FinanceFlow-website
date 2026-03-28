const { runFlowAI } = require("../../server/flowai-core");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const result = await runFlowAI(body);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error("netlify flowai error", err);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "Unable to process FlowAI request.",
        details: err instanceof Error ? err.message : "Unknown error"
      })
    };
  }
};
