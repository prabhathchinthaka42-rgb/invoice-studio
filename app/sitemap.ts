import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.invoice-studio.app";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: "2026-10-31",
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: "2026-10-31",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: "2026-10-31",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: "2026-10-31",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: "2026-11-05", // ⭐ අද දිනට වෙනස් කළා
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-create-professional-invoices-fast`,
      lastModified: "2026-10-31",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-write-invoice-for-services`,
      lastModified: "2026-11-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/freelance-invoice-example-what-to-include`,
      lastModified: "2026-11-04",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // ⭐ අලුතෙන් එකතු කරපු පෝස්ට් එක
    {
      url: `${baseUrl}/blog/how-to-invoice-for-services`,
      lastModified: "2026-11-05",
      changeFrequency: "monthly",
      priority: 0.8,
    },
        {
      url: `${baseUrl}/blog/word-vs-invoice-software`,
      lastModified: "2026-11-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
        {
      url: `${baseUrl}/blog/freelance-invoicing-checklist`,
      lastModified: "2026-11-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
        {
      url: `${baseUrl}/blog/5-invoicing-mistakes`,
      lastModified: "2026-11-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}