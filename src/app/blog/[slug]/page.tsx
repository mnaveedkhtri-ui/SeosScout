import { blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
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
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
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

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: post.content
            .split("\n")
            .map((line) => {
              if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
              if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
              if (line.trim() === "") return "";
              return `<p>${line}</p>`;
            })
            .join(""),
        }}
      />
    </main>
  );
}
