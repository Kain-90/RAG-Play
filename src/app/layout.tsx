import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "github-markdown-css";
import { Analytics } from "@vercel/analytics/react";
import AppConfig from "./config";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RAG Playground - Interactive RAG Pipeline Visualization",
  description:
    "An interactive tool for visualizing and understanding Retrieval-Augmented Generation (RAG) pipelines. Explore text splitting, vector embeddings, semantic search, and context generation in real-time.",
  keywords: [
    "RAG",
    "Retrieval-Augmented Generation",
    "LLM",
    "Vector Embeddings",
    "Semantic Search",
    "Text Splitting",
    "AI",
    "Machine Learning",
    "NLP",
  ],
  authors: [{ name: "Kain" }],
  openGraph: {
    title: "RAG Playground",
    description: "Interactive RAG Pipeline Visualization Tool",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Playground",
    description: "Interactive RAG Pipeline Visualization Tool",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Search Console Verification */}
        {AppConfig.googleSiteVerificationId && (
          <meta
            name="google-site-verification"
            content={AppConfig.googleSiteVerificationId}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
