import { requireAuth } from "./_lib/auth.js";
import { logEvent } from "./_lib/log.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!requireAuth(req, res)) return;

  try {
    const { args } = req.body || {};
    const agent = (args?.agent || "unknown").trim();
    const scope = args?.scope === "deep" ? "deep" : "fast";

    // Sample checks (extend for real infra signals)
    const checks = [
      { name: "abacus_api_key", ok: !!process.env.ABACUS_API_KEY },
      { name: "deployment_id", ok: !!process.env.ABACUS_DEPLOYMENT_ID },
      { name: "auth_key_present", ok: !!process.env.MCP_API_KEY }
    ];

    const detail = {
      agent,
      scope,
      checks,
      overallOk: checks.every(c => c.ok)
    };

    await logEvent("diagnostics", detail);

    return res.status(200).json({
      result: detail.overallOk ? "OK" : "ATTENTION",
      details: JSON.stringify(detail)
    });
  } catch (e) {
    await logEvent("diagnostics_exception", { message: e.message });
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
