import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://invoice-studio.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/app/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}