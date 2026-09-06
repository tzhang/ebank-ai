"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/lib/actions/auth";
import { avatarColor, avatarInitial } from "@/lib/profile-constants";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/llm", label: "金融大模型" },
  { href: "/harness", label: "Agent Harness" },
  { href: "/skills", label: "技能库" },
  { href: "/community", label: "社区" },
  { href: "/about", label: "关于" },
];

// M1 PROF-110 — 顶栏:登录后显示头像昵称下拉(资料/管理后台(角色判断)/退出)。
export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const isStaff = user?.role === "moderator" || user?.role === "admin";

  async function handleLogout() {
    await logoutAction();
  }

  const UserChip = (
    <>
      {user ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-full border border-navy-600 py-1 pl-1 pr-3 transition-colors hover:border-gold-500/40"
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-navy-900 ${avatarColor(user.email ?? user.id)}`}>
              {avatarInitial(user.name, user.email ?? user.id)}
            </span>
            <span className="max-w-24 truncate text-xs font-medium text-navy-100">
              {user.name ?? user.email}
            </span>
          </button>
          {userOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-navy-600 bg-navy-800 shadow-xl">
                <div className="border-b border-navy-700 px-4 py-2.5">
                  <div className="truncate text-xs font-medium text-white">{user.name ?? user.email}</div>
                  <div className="truncate font-mono text-[10px] text-navy-400">{user.email}</div>
                </div>
                <div className="py-1">
                  <Link
                    href="/account"
                    onClick={() => setUserOpen(false)}
                    className="block px-4 py-2 text-xs text-navy-100 hover:bg-navy-700"
                  >
                    个人资料
                  </Link>
                  {isStaff && (
                    <Link
                      href="/admin"
                      onClick={() => setUserOpen(false)}
                      className="block px-4 py-2 text-xs text-gold-300 hover:bg-navy-700"
                    >
                      管理后台
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-xs text-navy-300 hover:bg-navy-700 hover:text-white"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : status === "loading" ? (
        <div className="h-8 w-20 rounded-full border border-navy-700" />
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-navy-200 hover:bg-navy-700 hover:text-white"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:brightness-110"
          >
            注册
          </Link>
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/50 bg-navy-800/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-xs font-bold text-navy-900">
            e
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            ebank<span className="text-gold-300">.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-500/10 text-gold-300"
                    : "text-navy-200 hover:bg-navy-700 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 右侧:用户区(桌面) + 汉堡(移动) */}
        <div className="hidden items-center md:flex">{UserChip}</div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-navy-200 hover:bg-navy-700 hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-navy-700/50 bg-navy-800 md:hidden">
          <nav className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gold-500/10 text-gold-300"
                      : "text-navy-200 hover:bg-navy-700 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-navy-700/50 pt-2">
              {user ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-navy-700 hover:text-white">
                    个人资料
                  </Link>
                  {isStaff && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gold-300 hover:bg-navy-700">
                      管理后台
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-navy-300 hover:bg-navy-700 hover:text-white">
                    退出登录
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1 py-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-lg border border-navy-600 py-2 text-center text-sm text-navy-200">
                    登录
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 py-2 text-center text-sm font-semibold text-navy-900">
                    注册
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
