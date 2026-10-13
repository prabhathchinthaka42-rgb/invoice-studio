import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Studio App",
  description:
    "Create, manage, and download professional invoices in seconds.",
  // ⭐ App page එක Google එකේ index කරන්න ඕන නෑ (private tool එකක්)
  robots: {
    index: false,
    follow: true,
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}