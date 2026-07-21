import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/data/blog-posts";

export const metadata = {
  title: "Blog | SiteScout — SEO Tips, Guides & Best Practices",
  description: "Practical SEO guides, technical checklists, and strategies to help your website rank higher on Google.",
  alternates: {
    canonical: "https://seos-scout.vercel.app/blog",
  },
  openGraph: {
    title: "Blog | SiteScout",
    description: "Practical SEO guides, technical checklists, and strategies to help your website rank higher on Google.",
    url: "https://seos-scout.vercel.app/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">SEO Blog</h1>
        <p className="text-gray-400 text-lg">
          Practical guides and checklists to help your website rank higher.
        </p>
      </div>

      {blogPosts.length === 0 ? (
        <p className="text-center text-gray-500">
          New articles are coming soon. Check back shortly.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-500 transition-colors"
            >
              <div className="relative w-full h-48">
                <Image src={post.image} alt={post.imageAlt} fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-sm text-indigo-400 mb-2">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
