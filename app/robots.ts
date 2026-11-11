import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.invoice-studio.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /app එකට ඇතුල් වෙන්න ඉඩ දෙනවා, ඒත් index වෙන්නේ නෑ (noindex ටැග් එකෙන්)
        disallow: ["/api/", "/_next/"], 
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}