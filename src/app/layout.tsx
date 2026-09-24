import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internet Speed Checker | Broadband & Fiber Performance Test",
  description:
    "Accurately test your broadband internet speed including download Mbps, upload Mbps, ping latency, and jitter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
