import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DBTHON 2026 Certificate Portal",
  description: "Official DBTHON 2026 certificate portal by VIT SCOPE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}