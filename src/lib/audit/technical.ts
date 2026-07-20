import { fetchTextSafe, checkUrlStatus } from "./fetcher";
import type { LinkInfo } from "@/types/audit";

export async function checkRobotsTxt(baseUrl: string) {
  const origin = new URL(baseUrl).origin;
  const robotsUrl = `${origin}/robots.txt`;
  const result = await fetchTextSafe(robotsUrl);

  const content = result.ok ? result.text : null;
  let disallowsAll = false;
  if (content) {
    // Very common pattern for "block everything"
    const lines = content.split("\n").map((l) => l.trim().toLowerCase());
    let currentAgentIsWildcard = false;
    for (const line of lines) {
      if (line.startsWith("user-agent:")) {
        currentAgentIsWildcard = line.includes("*");
      }
      if (currentAgentIsWildcard && line === "disallow: /") {
        disallowsAll = true;
      }
    }
  }

  return {
    exists: result.ok,
    url: robotsUrl,
    content,
    disallowsAll,
  };
}

export async function checkSitemap(baseUrl: string, robotsContent: string | null) {
  const origin = new URL(baseUrl).origin;

  // Look for sitemap declared in robots.txt first
  if (robotsContent) {
    const match = robotsContent.match(/sitemap:\s*(\S+)/i);
    if (match) {
      const sitemapUrl = match[1];
      const check = await checkUrlStatus(sitemapUrl);
      if (check.ok) return { exists: true, url: sitemapUrl };
    }
  }

  // Fall back to common default location
  const defaultUrl = `${origin}/sitemap.xml`;
  const check = await checkUrlStatus(defaultUrl);
  return { exists: check.ok, url: check.ok ? defaultUrl : null };
}

export function checkSecurityHeaders(headers: Headers) {
  return {
    strictTransportSecurity: headers.has("strict-transport-security"),
    xContentTypeOptions: headers.has("x-content-type-options"),
    xFrameOptions: headers.has("x-frame-options"),
    contentSecurityPolicy: headers.has("content-security-policy"),
    referrerPolicy: headers.has("referrer-policy"),
  };
}

// Checks a sample of links for broken status (429/404/5xx etc).
// Capped and run concurrently with a limit to keep audit time reasonable.
export async function checkBrokenLinks(
  links: LinkInfo[],
  maxToCheck = 15
): Promise<LinkInfo[]> {
  const sample = links.slice(0, maxToCheck);
  const CONCURRENCY = 5;
  const results: LinkInfo[] = [];

  for (let i = 0; i < sample.length; i += CONCURRENCY) {
    const batch = sample.slice(i, i + CONCURRENCY);
    const checked = await Promise.all(
      batch.map(async (link) => {
        const status = await checkUrlStatus(link.href);
        return {
          ...link,
          isBroken: !status.ok,
          statusCode: status.status,
        };
      })
    );
    results.push(...checked);
  }

  // Any links beyond the sample are marked as not-checked (assume fine)
  return [...results, ...links.slice(maxToCheck)];
}
