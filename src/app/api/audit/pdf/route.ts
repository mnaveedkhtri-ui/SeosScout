import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit/engine";
import { normalizeUrl } from "@/lib/audit/fetcher";
import { generateAuditPdf } from "@/lib/audit/pdf";

export const maxDuration = 90;

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
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
    const pdfBytes = await generateAuditPdf(result);
    const host = new URL(normalized).hostname.replace(/\./g, "-");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sitescout-audit-${host}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate report: ${message}` }, { status: 502 });
  }
}
