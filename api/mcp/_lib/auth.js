// Simple Bearer auth: Authorization: Bearer <YOUR_SECRET_MCP_API_KEY>
export function requireAuth(req, res) {
  const auth = req.headers.authorization || "";
  const expected = `Bearer ${process.env.MCP_API_KEY}`;
  if (!process.env.MCP_API_KEY) {
    console.warn("[WARN] MCP_API_KEY not set – auth disabled for now.");
    return true;
  }
  if (auth !== expected) {
    res.status(403).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
