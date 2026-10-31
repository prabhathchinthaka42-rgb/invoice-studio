import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog-data";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// ⭐ අලුතෙන් එකතු කළේ මේකයි
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Generate static metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} — Invoice Studio`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 pt-20 pb-32">
        <Link
          href="/blog"
          className="text-sm text-blue-400 hover:text-blue-300 mb-8 inline-block"
        >
          ← Back to Blog
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
          {post.title}
        </h1>
        
        <p className="text-slate-500 mb-12">Published on {post.date}</p>
        
        <div className="prose prose-invert prose-lg max-w-none">
          {post.content}
        </div>
      </article>

      <Footer />
    </div>
  );
}