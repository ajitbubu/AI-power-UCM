import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL || "http://backend:8000";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const region = url.searchParams.get("region") || "auto";
  const gpc = url.searchParams.get("gpc") || "false";

  try {
    const response = await fetch(
      `${BACKEND}/api/ucm/runtime?region=${region}&gpc=${gpc}`,
      {
        headers: {
          "Sec-GPC": gpc === "true" ? "1" : "0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch runtime config" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Runtime API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
