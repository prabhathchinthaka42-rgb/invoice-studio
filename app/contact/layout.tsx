import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a question, feedback, or feature request? Get in touch with the Invoice Studio team. We typically respond within 24 hours.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}