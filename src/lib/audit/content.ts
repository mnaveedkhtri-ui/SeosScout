const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between both but by can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd they'll they're they've this those through to too under until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours yourself yourselves`.split(
    " "
  )
);

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const matches = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function fleschReadingEase(text: string): { score: number; label: string } {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const words = text.split(/\s+/).filter(Boolean);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const sentenceCount = Math.max(sentences.length, 1);
  const wordCount = Math.max(words.length, 1);

  const score =
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Very Difficult";
  if (clamped >= 90) label = "Very Easy";
  else if (clamped >= 80) label = "Easy";
  else if (clamped >= 70) label = "Fairly Easy";
  else if (clamped >= 60) label = "Standard";
  else if (clamped >= 50) label = "Fairly Difficult";
  else if (clamped >= 30) label = "Difficult";

  return { score: clamped, label };
}

export function extractKeywords(
  text: string,
  topN = 10
): { word: string; count: number; density: number }[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const total = words.length || 1;
  const freq: Record<string, number> = {};
  words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({
      word,
      count,
      density: Math.round((count / total) * 1000) / 10,
    }));
}

export function estimateSearchIntent(
  title: string | null,
  headings: string[],
  topKeywords: string[]
): string {
  const signal = `${title ?? ""} ${headings.join(" ")} ${topKeywords.join(" ")}`.toLowerCase();

  if (/(buy|price|pricing|discount|deal|shop|order|cart)/.test(signal))
    return "Transactional. Visitors likely intend to purchase or take direct action.";
  if (/(how to|guide|what is|tutorial|learn|tips|examples)/.test(signal))
    return "Informational. Visitors are seeking to learn or understand a topic.";
  if (/(best|top|vs|review|compare|comparison)/.test(signal))
    return "Commercial investigation. Visitors are comparing options before deciding.";
  if (/(login|sign in|official|homepage|contact)/.test(signal))
    return "Navigational. Visitors are looking for a specific site or page.";
  return "Mixed/Informational. General content intent detected.";
}

export function suggestHeadings(
  topKeywords: { word: string }[],
  existingH1: string
): string[] {
  const kws = topKeywords.slice(0, 5).map((k) => k.word);
  const base = existingH1 || kws[0] || "Your Topic";

  return [
    `What Is ${capitalize(base)}? A Complete Guide`,
    `${capitalize(kws[0] ?? base)}: Benefits and Key Features`,
    `How to Get Started with ${capitalize(kws[1] ?? base)}`,
    `${capitalize(kws[2] ?? base)} vs Alternatives: Which Is Right for You?`,
    `Frequently Asked Questions About ${capitalize(base)}`,
  ];
}

export function suggestKeywords(topKeywords: { word: string }[]): string[] {
  const base = topKeywords.map((k) => k.word);
  const suggestions: string[] = [];
  base.slice(0, 4).forEach((w) => {
    suggestions.push(`best ${w}`, `${w} guide`, `${w} for beginners`, `how does ${w} work`);
  });
  return Array.from(new Set(suggestions)).slice(0, 10);
}

export function generateFaqSuggestions(
  topKeywords: { word: string }[],
  title: string | null
): { question: string; answer: string }[] {
  const topic = title || topKeywords[0]?.word || "this topic";
  const kw = topKeywords.slice(0, 3).map((k) => k.word);

  return [
    {
      question: `What is ${topic}?`,
      answer: `Add a concise 2-3 sentence definition here that directly answers the question. This improves eligibility for featured snippets.`,
    },
    {
      question: `How does ${capitalize(kw[0] ?? topic)} work?`,
      answer: `Explain the core mechanism or process in plain language, ideally in under 50 words for snippet targeting.`,
    },
    {
      question: `Why is ${capitalize(kw[1] ?? topic)} important?`,
      answer: `Summarize the key benefit or use case, backed by a stat or example if available.`,
    },
    {
      question: `How much does ${capitalize(kw[2] ?? topic)} cost?`,
      answer: `If pricing is relevant, add a direct answer here. Pricing FAQs are frequently targeted by voice search.`,
    },
  ];
}

export function detectMissingEntities(
  text: string,
  title: string | null
): string[] {
  const missing: string[] = [];
  const lower = text.toLowerCase();

  if (!/\d{4}/.test(text)) missing.push("Publish/update date or year reference");
  if (!/(author|written by|by\s+[A-Z][a-z]+\s+[A-Z][a-z]+)/i.test(text))
    missing.push("Author attribution");
  if (!/(source|according to|study|research)/i.test(lower))
    missing.push("Cited sources or references");
  if (title && !lower.includes(title.toLowerCase().split(" ")[0]))
    missing.push("Primary keyword from title reinforced in body copy");
  if (!/(faq|frequently asked)/i.test(lower))
    missing.push("FAQ section for featured snippet eligibility");

  return missing;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function contentQualityScore(params: {
  wordCount: number;
  readability: number;
  h1Count: number;
  hasMetaDescription: boolean;
  imageAltRatio: number; // 0-1
}): number {
  let score = 0;

  // Length (up to 30 pts)
  if (params.wordCount >= 1500) score += 30;
  else if (params.wordCount >= 800) score += 24;
  else if (params.wordCount >= 400) score += 16;
  else if (params.wordCount >= 150) score += 8;

  // Readability (up to 25 pts) — sweet spot 50-70
  if (params.readability >= 50 && params.readability <= 80) score += 25;
  else if (params.readability >= 30) score += 15;
  else score += 5;

  // Structure (up to 20 pts)
  if (params.h1Count === 1) score += 20;
  else if (params.h1Count > 1) score += 8;

  // Meta description (15 pts)
  if (params.hasMetaDescription) score += 15;

  // Image accessibility (10 pts)
  score += Math.round(params.imageAltRatio * 10);

  return Math.min(100, Math.round(score));
}
