import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL || "http://backend:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND}/api/ucm/consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Sec-GPC": body.gpc ? "1" : "0",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Consent API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
