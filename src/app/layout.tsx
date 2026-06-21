import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ebank.ai — AI 时代的金融知识平台",
    template: "%s | ebank.ai",
  },
  description:
    "AI 时代金融知识平台：帮助大众利用大模型和智能体投资理财，赋能金融从业者学习 AI 工具、共享 Skills 与 MCP。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} bg-navy-900`}>
      <body className="flex min-h-screen flex-col bg-navy-900 text-navy-100 antialiased font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
