import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // ⚠️ මේක ඔබේ deployment එකෙන් පස්සේ අලුත් URL එකට මාරු කරන්න
  metadataBase: new URL("https://invoice-studio.vercel.app"),
  title: {
    default: "Invoice Studio — Invoices in Seconds",
    template: "%s | Invoice Studio",
  },
  description:
    "Create professional invoices in seconds. Free to start, no signup required. Built for freelancers and small businesses.",
  keywords: [
    "invoice generator",
    "free invoice",
    "invoice maker",
    "small business invoice",
    "freelancer invoice",
    "pdf invoice",
    "sri lanka invoice",
  ],
  authors: [{ name: "Chinthaka Prabhath" }],
  creator: "Chinthaka Prabhath",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Invoice Studio",
    title: "Invoice Studio — Invoices in Seconds",
    description:
      "Create professional invoices in seconds. Free to start, no signup required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Studio — Invoices in Seconds",
    description:
      "Create professional invoices in seconds. Free to start, no signup required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Invoice Studio",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Create professional invoices in seconds. Free to start, no signup required.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Chinthaka Prabhath",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
