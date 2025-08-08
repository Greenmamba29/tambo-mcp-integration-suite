import { requireAuth } from "./_lib/auth.js";
import { logEvent } from "./_lib/log.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!requireAuth(req, res)) return;
  const start = Date.now();

  try {
    const { tool, args } = req.body || {};
    if (tool !== "routeRequest") {
      return res.status(400).json({ error: "Unsupported tool", supported: ["routeRequest"] });
    }
    const tier = args?.tier || "Standard";
    const payload = args?.payload || "";

    // Call Abacus ChatLLM deployment
    const abacusResp = await fetch("https://api.abacus.ai/chatllm/execute", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ABACUS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: `User tier: ${tier}\nPayload: "${payload}"\nRespond ONLY in JSON using the TAMBO routing format.`,
        model: "chatllm",
        deploymentId: process.env.ABACUS_DEPLOYMENT_ID
      })
    });

    if (!abacusResp.ok) {
      const text = await abacusResp.text();
      await logEvent("execute_error", { status: abacusResp.status, text });
      return res.status(500).json({ error: "Abacus failed", details: text });
    }
    const data = await abacusResp.json();

    const latencyMs = Date.now() - start;
    await logEvent("execute_ok", { tier, latencyMs, tool, result: data });

    // Ensure JSON shape for UI/ABACUS consumers
    return res.status(200).json({
      ...data,
      meta: { latencyMs }
    });
  } catch (e) {
    await logEvent("execute_exception", { message: e.message });
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
