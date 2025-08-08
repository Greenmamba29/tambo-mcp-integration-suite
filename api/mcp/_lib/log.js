// Optional: structured logging to Supabase (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
export async function logEvent(kind, payload = {}) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const resp = await fetch(`${process.env.SUPABASE_URL}/rest/v1/mcp_logs`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify([{ kind, payload, ts: new Date().toISOString() }])
    });
    if (!resp.ok) throw new Error(await resp.text());
  } catch (e) {
    console.warn("[logEvent] failed:", e.message);
  }
}
