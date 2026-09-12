import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postula — Job Application Tracker",
  description: "Track applications, compare role fit, and plan the next step in your job search.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
