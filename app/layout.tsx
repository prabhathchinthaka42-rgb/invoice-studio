import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"; 
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
  metadataBase: new URL("https://www.invoice-studio.app"),
  verification: {
    google: "OyLW78tiJWk_7jXLCBGjFD1bden-ISA2SGeg8pAGRtQ",
  },
  title: {
    default: "Invoice Studio — Invoices in Seconds",
    template: "%s | Invoice Studio",
  },
  description:
    "Create professional invoices in seconds. Free to start. Built for freelancers and small businesses.",
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
      "Create professional invoices in seconds. Free to start.",
    url: "https://www.invoice-studio.app",
    images: [
      {
        url: "/og-image.png", // ⚠️ ඔබ ඉමේජ් එක සේව් කරපු නම මෙතන දාන්න (jpg නම් .jpg කියලා)
        width: 1200,
        height: 630,
        alt: "Invoice Studio App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Studio — Invoices in Seconds",
    description:
      "Create professional invoices in seconds. Free to start.",
    images: ["/og-image.png"], // ⚠️ මෙතනත් ඔබේ ඉමේජ් එකේ නමම දාන්න
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
      "Create professional invoices in seconds. Free to start.",
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
         <Analytics />
      </body>
    </html>
  );
}
