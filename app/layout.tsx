import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scroll Video Maker",
  description: "Turn your video into an interactive scroll animation website.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='28' rx='8' fill='%23141420' stroke='%23818cf8' stroke-width='2'/><path d='M13 10.5C13 9.7 13.9 9.2 14.6 9.6L21.4 14.5C22.1 15 22.1 16 21.4 16.5L14.6 21.4C13.9 21.8 13 21.3 13 20.5V10.5Z' fill='%23c084fc'/></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0d",
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

