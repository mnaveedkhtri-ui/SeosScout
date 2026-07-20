import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit/engine";
import { normalizeUrl } from "@/lib/audit/fetcher";

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "A URL is required." }, { status: 400 });
  }

  let normalized: string;
  try {
    normalized = normalizeUrl(rawUrl);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  try {
    const result = await runAudit(normalized);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isAbort = message.toLowerCase().includes("abort");
    return NextResponse.json(
      {
        error: isAbort
          ? "The site took too long to respond. It may be blocking automated requests or is down."
          : `Failed to audit this URL: ${message}`,
      },
      { status: 502 }
    );
  }
}
