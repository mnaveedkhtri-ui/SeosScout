// Real network fetching layer. Times requests for TTFB, captures headers,
// and normalizes URLs. No mocked responses — this hits the live internet.

export interface FetchedPage {
  url: string;
  finalUrl: string;
  html: string;
  status: number;
  headers: Headers;
  ttfbMs: number;
  totalMs: number;
  sizeBytes: number;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; SiteScout/1.0; +https://sitescout.app/bot)";

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  // Will throw if truly invalid — caller handles it.
  const u = new URL(url);
  return u.toString();
}

export async function fetchPage(rawUrl: string, timeoutMs = 15000): Promise<FetchedPage> {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const start = performance.now();
  let firstByte = start;

  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });
    firstByte = performance.now();
    const html = await res.text();
    const totalMs = performance.now() - start;
    const ttfbMs = firstByte - start;
    const sizeBytes = new TextEncoder().encode(html).length;

    return {
      url,
      finalUrl: res.url || url,
      html,
      status: res.status,
      headers: res.headers,
      ttfbMs: Math.round(ttfbMs),
      totalMs: Math.round(totalMs),
      sizeBytes,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTextSafe(
  url: string,
  timeoutMs = 8000
): Promise<{ ok: boolean; status: number; text: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    clearTimeout(timeout);
    if (!res.ok) return { ok: false, status: res.status, text: null };
    const text = await res.text();
    return { ok: true, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: null };
  }
}

export async function checkUrlStatus(
  url: string,
  timeoutMs = 6000
): Promise<{ ok: boolean; status: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT },
      });
    } catch {
      // Some servers reject HEAD — fall back to GET
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT },
      });
    }
    clearTimeout(timeout);
    return { ok: res.status < 400, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
