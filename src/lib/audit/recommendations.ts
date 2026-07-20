import type { AuditResult, Recommendation } from "@/types/audit";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `rec-${idCounter}`;
}

export function generateRecommendations(
  data: Omit<AuditResult, "overallScore" | "categoryScores" | "recommendations">
): Recommendation[] {
  idCounter = 0;
  const recs: Recommendation[] = [];
  const push = (r: Omit<Recommendation, "id">) => recs.push({ ...r, id: nextId() });

  // --- META ---
  if (!data.meta.title) {
    push({
      category: "Meta Tags",
      title: "Missing page title",
      severity: "critical",
      whyItMatters:
        "The title tag is one of the strongest on-page ranking signals and is what users see as the clickable headline in search results.",
      howToFix:
        "Add a unique <title> tag between 30-60 characters that includes your primary keyword near the front.",
      expectedImpact: "High: directly affects rankings and click-through rate.",
      priority: "high",
    });
  } else if (data.meta.titleLength < 30 || data.meta.titleLength > 60) {
    push({
      category: "Meta Tags",
      title: `Title tag length is suboptimal (${data.meta.titleLength} characters)`,
      severity: "warning",
      whyItMatters:
        "Titles outside the 30-60 character range are often truncated in search results or fail to use available space to include relevant keywords.",
      howToFix:
        "Rewrite the title to fall between 30 and 60 characters while keeping it descriptive and keyword-rich.",
      expectedImpact: "Medium: improves SERP click-through rate.",
      priority: "medium",
    });
  } else {
    push({
      category: "Meta Tags",
      title: "Title tag is well optimized",
      severity: "pass",
      whyItMatters: "A properly sized, descriptive title supports both rankings and CTR.",
      howToFix: "No action needed.",
      expectedImpact: "Maintained.",
      priority: "low",
    });
  }

  if (!data.meta.metaDescription) {
    push({
      category: "Meta Tags",
      title: "Missing meta description",
      severity: "critical",
      whyItMatters:
        "Meta descriptions influence click-through rate from search results and are often shown as the snippet text.",
      howToFix:
        "Add a meta description between 70-160 characters that summarizes the page and includes a call to action.",
      expectedImpact: "High: improves CTR from search results.",
      priority: "high",
    });
  } else if (data.meta.metaDescriptionLength < 70 || data.meta.metaDescriptionLength > 160) {
    push({
      category: "Meta Tags",
      title: `Meta description length is suboptimal (${data.meta.metaDescriptionLength} characters)`,
      severity: "warning",
      whyItMatters: "Descriptions that are too short waste opportunity; too long get truncated by Google.",
      howToFix: "Adjust the meta description to fall between 70 and 160 characters.",
      expectedImpact: "Medium: improves SERP presentation.",
      priority: "medium",
    });
  }

  if (!data.meta.canonical) {
    push({
      category: "Meta Tags",
      title: "Missing canonical tag",
      severity: "warning",
      whyItMatters:
        "Without a canonical tag, search engines may index duplicate versions of this page (with tracking params, trailing slashes, etc.), diluting ranking signals.",
      howToFix: "Add <link rel=\"canonical\" href=\"...\"> pointing to the preferred URL for this page.",
      expectedImpact: "Medium: consolidates ranking signals to one URL.",
      priority: "medium",
    });
  }

  if (!data.meta.lang) {
    push({
      category: "Meta Tags",
      title: "Missing lang attribute on <html>",
      severity: "info",
      whyItMatters: "Declaring language helps search engines and assistive technology serve the right audience.",
      howToFix: 'Add lang="en" (or the appropriate code) to the <html> tag.',
      expectedImpact: "Low: accessibility and international targeting.",
      priority: "low",
    });
  }

  // --- HEADINGS ---
  if (data.headings.h1Count === 0) {
    push({
      category: "Headings",
      title: "No H1 tag found",
      severity: "critical",
      whyItMatters: "The H1 tells both users and search engines the primary topic of the page.",
      howToFix: "Add exactly one H1 tag containing your primary keyword near the top of the page content.",
      expectedImpact: "High: reinforces topical relevance.",
      priority: "high",
    });
  } else if (data.headings.h1Count > 1) {
    push({
      category: "Headings",
      title: `Multiple H1 tags detected (${data.headings.h1Count})`,
      severity: "warning",
      whyItMatters: "Multiple H1s can dilute topical focus and confuse semantic structure.",
      howToFix: "Keep a single H1 and convert additional ones to H2/H3 as appropriate.",
      expectedImpact: "Medium: clarifies page structure for crawlers.",
      priority: "medium",
    });
  }

  data.headings.hierarchyIssues.forEach((issue) => {
    push({
      category: "Headings",
      title: "Heading hierarchy issue",
      severity: "info",
      whyItMatters: issue,
      howToFix: "Restructure headings so levels descend in order (H1 → H2 → H3) without skipping.",
      expectedImpact: "Low-Medium: improves content structure and accessibility.",
      priority: "low",
    });
  });

  // --- IMAGES ---
  if (data.images.total > 0 && data.images.missingAlt > 0) {
    const pct = Math.round((data.images.missingAlt / data.images.total) * 100);
    push({
      category: "Images",
      title: `${data.images.missingAlt} of ${data.images.total} images missing alt text (${pct}%)`,
      severity: pct > 50 ? "critical" : "warning",
      whyItMatters:
        "Alt text helps search engines understand image content and is essential for screen-reader accessibility.",
      howToFix: "Add descriptive alt attributes to every meaningful image; use alt=\"\" for purely decorative images.",
      expectedImpact: "Medium: improves image search visibility and accessibility.",
      priority: pct > 50 ? "high" : "medium",
    });
  }

  // --- LINKS ---
  if (data.links.internal.length === 0) {
    push({
      category: "Links",
      title: "No internal links found",
      severity: "warning",
      whyItMatters: "Internal links distribute page authority and help search engines discover other pages on your site.",
      howToFix: "Add contextual links to related pages within your site content.",
      expectedImpact: "Medium: improves crawlability and site structure.",
      priority: "medium",
    });
  }
  if (data.links.brokenCount > 0) {
    push({
      category: "Links",
      title: `${data.links.brokenCount} broken link(s) detected`,
      severity: "critical",
      whyItMatters: "Broken links harm user experience and waste crawl budget, and can signal poor site maintenance.",
      howToFix: "Fix or remove broken links; use 301 redirects for moved content.",
      expectedImpact: "High: prevents crawl errors and lost link equity.",
      priority: "high",
    });
  }

  // --- SOCIAL ---
  if (Object.keys(data.social.openGraph).length === 0) {
    push({
      category: "Social",
      title: "Missing Open Graph tags",
      severity: "warning",
      whyItMatters: "Open Graph tags control how your page appears when shared on Facebook, LinkedIn, and other platforms.",
      howToFix: "Add og:title, og:description, og:image, and og:url meta tags.",
      expectedImpact: "Medium: improves social share appearance and CTR.",
      priority: "medium",
    });
  } else if (!data.social.hasOgImage) {
    push({
      category: "Social",
      title: "Missing og:image tag",
      severity: "warning",
      whyItMatters: "Without an og:image, shared links show no preview image, significantly reducing engagement.",
      howToFix: "Add an og:image tag pointing to a 1200x630px image.",
      expectedImpact: "Medium: improves social engagement.",
      priority: "medium",
    });
  }

  if (!data.social.hasTwitterCard) {
    push({
      category: "Social",
      title: "Missing Twitter Card tags",
      severity: "info",
      whyItMatters: "Twitter Card tags control the preview shown when your page is shared on X/Twitter.",
      howToFix: 'Add twitter:card, twitter:title, twitter:description, and twitter:image meta tags.',
      expectedImpact: "Low-Medium: improves social presentation.",
      priority: "low",
    });
  }

  // --- SCHEMA ---
  if (!data.schema.found) {
    push({
      category: "Structured Data",
      title: "No schema markup (JSON-LD) detected",
      severity: "warning",
      whyItMatters:
        "Structured data helps search engines understand page content and enables rich results (stars, FAQs, breadcrumbs) in the SERP.",
      howToFix:
        "Add relevant JSON-LD schema (Organization, Article, Product, FAQPage, etc.) matching your page type.",
      expectedImpact: "Medium-High: enables rich snippets and improves CTR.",
      priority: "high",
    });
  }

  // --- TECHNICAL ---
  if (!data.technical.https) {
    push({
      category: "Technical SEO",
      title: "Site is not served over HTTPS",
      severity: "critical",
      whyItMatters: "HTTPS is a confirmed Google ranking signal and is required for user trust and security.",
      howToFix: "Install an SSL certificate and redirect all HTTP traffic to HTTPS.",
      expectedImpact: "High: ranking factor and trust signal.",
      priority: "high",
    });
  }

  if (!data.technical.robotsTxt.exists) {
    push({
      category: "Technical SEO",
      title: "robots.txt not found",
      severity: "warning",
      whyItMatters: "robots.txt guides search engine crawlers on which parts of the site to crawl or avoid.",
      howToFix: "Add a robots.txt file at the site root with appropriate crawl directives and a sitemap reference.",
      expectedImpact: "Medium: improves crawl efficiency.",
      priority: "medium",
    });
  } else if (data.technical.robotsTxt.disallowsAll) {
    push({
      category: "Technical SEO",
      title: "robots.txt is blocking all crawlers",
      severity: "critical",
      whyItMatters: "A wildcard \"Disallow: /\" prevents search engines from indexing any page on the site.",
      howToFix: "Remove the blanket disallow rule unless intentionally blocking the entire site (e.g. staging).",
      expectedImpact: "Critical: site may not appear in search at all.",
      priority: "high",
    });
  }

  if (!data.technical.sitemap.exists) {
    push({
      category: "Technical SEO",
      title: "XML sitemap not found",
      severity: "warning",
      whyItMatters: "Sitemaps help search engines discover and prioritize pages, especially on larger sites.",
      howToFix: "Generate an XML sitemap and reference it in robots.txt and Google Search Console.",
      expectedImpact: "Medium: improves crawl discovery.",
      priority: "medium",
    });
  }

  const headerFails = Object.entries(data.technical.securityHeaders).filter(([, v]) => !v);
  if (headerFails.length > 0) {
    push({
      category: "Security",
      title: `${headerFails.length} recommended security header(s) missing`,
      severity: headerFails.length > 3 ? "warning" : "info",
      whyItMatters:
        "Security headers (HSTS, CSP, X-Frame-Options, etc.) protect against common attacks and are increasingly factored into trust signals.",
      howToFix:
        "Configure your server/CDN to send Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, and Referrer-Policy headers.",
      expectedImpact: "Low-Medium: improves security posture and trust.",
      priority: "low",
    });
  }

  if (data.technical.pageSizeKb > 3000) {
    push({
      category: "Performance",
      title: `Large page size (${(data.technical.pageSizeKb / 1024).toFixed(2)} MB)`,
      severity: "warning",
      whyItMatters: "Large page weight slows load time, which hurts both rankings and user experience.",
      howToFix: "Compress images, minify CSS/JS, and defer non-critical resources.",
      expectedImpact: "Medium: improves Core Web Vitals and bounce rate.",
      priority: "medium",
    });
  }

  if (!data.technical.mobileFriendly.hasViewportMeta) {
    push({
      category: "Mobile",
      title: "Missing responsive viewport meta tag",
      severity: "critical",
      whyItMatters: "Without a viewport tag, mobile browsers render a desktop layout, badly hurting mobile usability and rankings (mobile-first indexing).",
      howToFix: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      expectedImpact: "High: mobile-first indexing directly affects rankings.",
      priority: "high",
    });
  }

  // --- PERFORMANCE ---
  if (data.performance.ttfbMs > 600) {
    push({
      category: "Performance",
      title: `Slow server response time (TTFB: ${data.performance.ttfbMs}ms)`,
      severity: "warning",
      whyItMatters: "Time to First Byte impacts Largest Contentful Paint, a Core Web Vital and ranking factor.",
      howToFix: "Use caching, a CDN, or upgrade server resources to reduce backend response time.",
      expectedImpact: "Medium: improves Core Web Vitals.",
      priority: "medium",
    });
  }

  // --- REAL CORE WEB VITALS (PageSpeed Insights) ---
  const mobilePsi = data.performance.pageSpeed?.mobile;
  if (mobilePsi) {
    if (mobilePsi.performanceScore < 50) {
      push({
        category: "Performance",
        title: `Poor mobile PageSpeed score (${mobilePsi.performanceScore}/100)`,
        severity: "critical",
        whyItMatters:
          "Google indexes and ranks primarily using the mobile version of your site. A low mobile performance score usually means real users are bouncing before the page finishes loading.",
        howToFix:
          "Open the site on pagespeed.web.dev for the full opportunity list. Typically image compression, deferring unused JS/CSS, and reducing render-blocking resources have the biggest impact.",
        expectedImpact: "High: Core Web Vitals are a confirmed ranking factor and directly affect conversion rate.",
        priority: "high",
      });
    } else if (mobilePsi.performanceScore < 90) {
      push({
        category: "Performance",
        title: `Mobile PageSpeed score needs improvement (${mobilePsi.performanceScore}/100)`,
        severity: "warning",
        whyItMatters: "Scores under 90 mean at least one Core Web Vital is likely outside the 'good' threshold on mobile.",
        howToFix: "Review the Lab Data breakdown (LCP, CLS, TBT) below and address whichever metric is flagged as 'poor' or 'needs improvement' first.",
        expectedImpact: "Medium: closes the gap to a fully 'good' Core Web Vitals assessment.",
        priority: "medium",
      });
    } else {
      push({
        category: "Performance",
        title: `Strong mobile PageSpeed score (${mobilePsi.performanceScore}/100)`,
        severity: "pass",
        whyItMatters: "A high mobile performance score correlates with better rankings and lower bounce rates.",
        howToFix: "No action needed. Keep monitoring after major content or design changes.",
        expectedImpact: "Maintained.",
        priority: "low",
      });
    }

    if (mobilePsi.labData.lcp.rating === "poor") {
      push({
        category: "Performance",
        title: `Largest Contentful Paint is slow on mobile (${mobilePsi.labData.lcp.displayValue})`,
        severity: "critical",
        whyItMatters: "LCP measures how long the main content takes to appear. Google's threshold for 'good' is 2.5s, and this page is well past it.",
        howToFix: "Preload the LCP image/font, remove render-blocking CSS/JS above the fold, and use a CDN to cut server response time.",
        expectedImpact: "High: LCP is one of the three official Core Web Vitals.",
        priority: "high",
      });
    }

    if (mobilePsi.labData.cls.rating === "poor") {
      push({
        category: "Performance",
        title: `Layout shift is high on mobile (CLS: ${mobilePsi.labData.cls.displayValue})`,
        severity: "warning",
        whyItMatters: "Cumulative Layout Shift measures visual instability. Elements jumping around as the page loads frustrates users and can cause mis-clicks.",
        howToFix: "Set explicit width/height (or aspect-ratio) on images and embeds, and avoid injecting content above existing content after load.",
        expectedImpact: "Medium: CLS is one of the three official Core Web Vitals.",
        priority: "medium",
      });
    }

    if (mobilePsi.fieldData.available && mobilePsi.fieldData.overallCategory === "SLOW") {
      push({
        category: "Performance",
        title: "Real users are experiencing this page as slow",
        severity: "critical",
        whyItMatters: "This isn't a lab estimate. It's aggregated from actual Chrome users (CrUX) visiting this URL over the last 28 days.",
        howToFix: "Prioritize whichever field metric (LCP/INP/CLS) is rated 'poor' above the fold. Field data reflects real network and device conditions your visitors face.",
        expectedImpact: "High: field data is what Google actually uses for the Core Web Vitals ranking signal.",
        priority: "high",
      });
    }
  } else if (data.performance.pageSpeedMobileError) {
    push({
      category: "Performance",
      title: "Couldn't fetch real Core Web Vitals from PageSpeed Insights",
      severity: "info",
      whyItMatters: `PSI request failed: ${data.performance.pageSpeedMobileError} The performance score above falls back to a fetch-timing estimate.`,
      howToFix: "Re-run the audit in a moment, or set a PAGESPEED_API_KEY (see README) if this keeps happening. The shared quota without a key is heavily rate-limited.",
      expectedImpact: "N/A: informational.",
      priority: "low",
    });
  }

  // --- CONTENT ---
  if (data.content.wordCount < 300) {
    push({
      category: "Content",
      title: `Thin content detected (${data.content.wordCount} words)`,
      severity: "warning",
      whyItMatters: "Pages with very little content often struggle to rank for competitive keywords and may be seen as low-value.",
      howToFix: "Expand the content to comprehensively cover the topic. Aim for 800+ words where appropriate.",
      expectedImpact: "Medium-High: depends on competitive landscape.",
      priority: "medium",
    });
  }

  if (data.content.readabilityScore < 40) {
    push({
      category: "Content",
      title: `Content may be difficult to read (Flesch score: ${data.content.readabilityScore})`,
      severity: "info",
      whyItMatters: "Overly complex text increases bounce rate and reduces engagement, indirectly affecting rankings.",
      howToFix: "Shorten sentences, use simpler words, and break up long paragraphs.",
      expectedImpact: "Low-Medium: improves engagement metrics.",
      priority: "low",
    });
  }

  // Sort: critical first, then warning, info, pass; within that by priority
  const sevOrder = { critical: 0, warning: 1, info: 2, pass: 3 };
  const prioOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => {
    if (sevOrder[a.severity] !== sevOrder[b.severity])
      return sevOrder[a.severity] - sevOrder[b.severity];
    return prioOrder[a.priority] - prioOrder[b.priority];
  });

  return recs;
}
