import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Scenery Studio",
  description: "Layer-based scenery editor live demo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

