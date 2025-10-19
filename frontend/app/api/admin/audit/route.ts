
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:8000";
const ADMIN_KEY = process.env.ADMIN_API_KEY || "dev-admin-key";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const limit = url.searchParams.get("limit") ?? "50";
  
  // Build query params
  const params = new URLSearchParams();
  params.set("limit", limit);
  if (type) {
    params.set("type", type);
  }
  
  const r = await fetch(`${BACKEND}/api/ucm/audit?${params.toString()}`, {
    headers: { "X-Admin-Key": ADMIN_KEY },
    cache: "no-store",
  });
  
  if (!r.ok) {
    return NextResponse.json({ error: "Failed to fetch audit data" }, { status: r.status });
  }
  
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
