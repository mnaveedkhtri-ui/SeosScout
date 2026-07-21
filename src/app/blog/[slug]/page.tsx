import { blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | SiteScout Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://seos-scout.vercel.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://seos-scout.vercel.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      images: [post.image],
    },
  };
}

function formatInline(text: string) {
  let result = text.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-bold text-white">$1</strong>'
  );
  result = result.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" class="text-indigo-400 underline underline-offset-2 hover:text-indigo-300">$1</a>'
  );
  return result;
}

function renderContent(content: string) {
  const lines = content.split("\n");
  let html = "";
  let inList = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const imageMatch = line.match(/^!\[(.*?)\]\((.+?)\)$/);
    if (imageMatch) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<img src="${imageMatch[2]}" alt="${imageMatch[1]}" class="rounded-xl w-full my-6" />`;
    } else if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2 class="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">${formatInline(line.slice(3))}</h2>`;
    } else if (line.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3 class="text-xl font-semibold text-white mt-8 mb-3">${formatInline(line.slice(4))}</h3>`;
    } else if (line.startsWith("- ")) {
      if (!inList) { html += '<ul class="list-disc pl-6 mb-5 space-y-2">'; inList = true; }
      html += `<li class="text-zinc-300">${formatInline(line.slice(2))}</li>`;
    } else if (line === "") {
      if (inList) { html += "</ul>"; inList = false; }
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p class="text-zinc-300 mb-5 leading-relaxed">${formatInline(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.image,
    author: { "@type": "Organization", name: "SiteScout" },
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/blog" className="text-indigo-400 text-sm hover:underline">
        ← Back to Blog
      </Link>
      <div className="flex items-center gap-3 text-sm text-indigo-400 mt-6 mb-3">
        <span>{post.category}</span>
        <span>•</span>
        <span>{post.readTime}</span>
      </div>
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      <div className="relative w-full h-80 rounded-xl overflow-hidden mb-8">
        <Image src={post.image} alt={post.imageAlt} fill className="object-cover" priority />
      </div>
      <div
        className="max-w-none"
        dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
      />
    </main>
  );
}
