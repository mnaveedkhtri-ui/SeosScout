export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
}

export const blogPosts: BlogPost[] = [
  // Yahan apni asli blog posts add karein, is format mein:
  // {
  //   slug: "post-ka-url-slug",
  //   title: "Post ka title",
  //   excerpt: "Chhota sa summary, 1-2 lines",
  //   date: "2026-07-21",
  //   readTime: "5 min read",
  //   category: "Category name",
  //   keywords: ["keyword1", "keyword2"],
  //   content: `
  //     ## Heading
  //     Paragraph text yahan...
  //   `,
  // },
];
