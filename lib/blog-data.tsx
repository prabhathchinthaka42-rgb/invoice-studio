import Link from "next/link";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: React.ReactNode;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-create-professional-invoices-fast",
    title: "How to Create Professional Invoices in Seconds (Free Tool)",
    description: "Stop wasting time on manual invoicing. Learn how to generate professional, watermarked-free PDF invoices instantly with our privacy-first tool.",
    date: "October 31, 2026",
    content: (
      <div className="space-y-6 text-slate-300">
        <p className="text-lg">
          If you're a freelancer or a small business owner, you know the pain of invoicing. You finish a project, but instead of getting paid, you spend 30 minutes opening Word, finding a template, formatting numbers, and exporting to PDF. 
        </p>
        <p>
          It's frustrating. Your time should be spent on your craft, not on admin work. That's why we built <strong>Invoice Studio</strong> — a tool designed to help you create beautiful, professional invoices in seconds.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Why Traditional Invoicing Tools Fail</h2>
        <p>
          Most invoice tools on the market are bloated. They require you to sign up, create an account, verify your email, and sometimes even pay a subscription just to use basic features. 
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>They are slow:</strong> You have to re-enter your company details every single time.</li>
          <li><strong>They lack privacy:</strong> Your client data is stored on their servers.</li>
          <li><strong>They are expensive:</strong> You pay monthly fees for features you don't even use.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">The "Set Up Once" Approach</h2>
        <p>
          At Invoice Studio, we believe invoicing should be lightning-fast. With our tool, you set up your company details, logo, and bank information <em>once</em>. After that, every invoice takes less than 10 seconds to generate.
        </p>
        <p>
          Simply enter the client's name, add your line items, and click "Download PDF". It's that simple.
        </p>

        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-xl my-8">
          <h3 className="text-xl font-bold text-white mb-3">Try it for free</h3>
          <p className="mb-4">Ready to save hours on your invoicing? Try our free plan today.</p>
          <Link href="/app" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Create Your First Invoice
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Privacy First</h2>
        <p>
          Unlike other tools, we prioritize your privacy. Your invoice data is stored securely, and we don't sell your information. The free plan includes a tiny watermark, but you can upgrade to Pro at any time to remove it and unlock unlimited invoices.
        </p>
      </div>
    ),
  },
];