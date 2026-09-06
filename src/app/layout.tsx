import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ebank.ai - 金融大模型与 Agent Harness 平台",
    template: "%s | ebank.ai",
  },
  description:
    "ebank.ai 聚焦金融大模型与 Agent Harness：金融大模型的选型与评测，Claude Code、Codex 等智能体运行框架的金融实战，以及 Skills 与 MCP 技能生态。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} bg-navy-900`}>
      <body className="flex min-h-screen flex-col bg-navy-900 text-navy-100 antialiased font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
