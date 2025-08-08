import { requireAuth } from "./_lib/auth.js";
import { logEvent } from "./_lib/log.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!requireAuth(req, res)) return;

  try {
    const { args } = req.body || {};
    const componentId = args?.componentId?.trim();
    const updateInstructions = args?.updateInstructions?.trim();
    const author = args?.author || "unknown";

    if (!componentId || !updateInstructions) {
      return res.status(400).json({ error: "Missing componentId or updateInstructions" });
    }

    // TODO: implement your real update pipeline here
    // e.g., call a build hook, write a PR, or push to a config store
    await logEvent("component_update", { componentId, author, updateInstructions });

    return res.status(200).json({
      status: "accepted",
      timestamp: new Date().toISOString(),
      log: `Component ${componentId} update recorded by ${author}`
    });
  } catch (e) {
    await logEvent("component_update_exception", { message: e.message });
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
