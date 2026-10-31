import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata = {
  title: "Blog — Invoice Studio",
  description: "Tips, guides, and insights on freelancing, small business management, and invoicing.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Invoice Studio Blog</h1>
          <p className="text-lg text-slate-400">Insights for freelancers and small businesses.</p>
        </div>

        <div className="space-y-8">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <p className="text-sm text-blue-400 font-medium mb-2">{post.date}</p>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">{post.description}</p>
              <span className="text-sm font-semibold text-white">Read more →</span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}