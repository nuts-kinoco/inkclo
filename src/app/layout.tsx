import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INKCLO - Splatoon 3 Coordinate Builder",
  description: "Create, save and share your Splatoon 3 coordinates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 z-50 flex items-center px-6">
          <Link href="/" className="font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
            INKCLO
          </Link>
          <nav className="flex gap-4 ml-8">
            <a href="/create" className="text-sm font-bold text-gray-600 hover:text-black">Builder</a>
            <a href="/favorites" className="text-sm font-bold text-gray-600 hover:text-black">Favorites</a>
          </nav>
        </header>
        <main className="flex-1 flex flex-col relative mt-[60px]">
          {children}
        </main>
      </body>
    </html>
  );
}
