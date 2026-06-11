import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-medium min-h-screen flex flex-col transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center px-6 transition-colors duration-300">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="INKCLO Logo" width={32} height={32} className="rounded" />
              <span className="font-black text-2xl tracking-tighter">INKCLO</span>
            </Link>
            <nav className="flex gap-4 ml-8">
              <a href="/create" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Builder</a>
              <a href="/favorites" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Favorites</a>
              <a href="/magazine" className="text-sm font-bold text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300">Magazine</a>
              {/* Temporarily added admin link for user convenience */}
              <a href="/admin/tags" className="text-xs font-bold text-gray-300 dark:text-gray-700 hover:text-gray-400 dark:hover:text-gray-500 self-center ml-2">タグ管理(Admin)</a>
            </nav>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 flex flex-col relative mt-[60px]">
            {children}
          </main>
          <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            Powered by{' '}
            <a 
              href="https://x.com/natsukino_co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold hover:text-black dark:hover:text-white transition-colors"
            >
              なつきのこ (@natsukino_co)
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
