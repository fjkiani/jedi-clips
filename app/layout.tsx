import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "JediClip — AI Long-to-Short Video Generator | Jedi Labs",
  description:
    "Transform long videos into viral shorts with AI-powered scene detection, auto captions, and one-click export. Built by Jedi Labs — Production, Not Pilots.",
  keywords: [
    "video to shorts",
    "AI video generator",
    "short video maker",
    "viral clips",
    "auto captions",
    "Jedi Labs",
    "JediClip",
  ],
  openGraph: {
    title: "JediClip — AI Long-to-Short Video Generator",
    description:
      "Transform long videos into viral shorts with AI-powered scene detection, auto captions, and one-click export.",
    url: "https://jediclip.jedilabs.org",
    siteName: "JediClip",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn("h-full", "antialiased", inter.variable, dmMono.variable)}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
