"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface InstallPopoverProps {
  name: string;
  type: "Skill" | "MCP";
  installGuide: string;
  configSnippet: string;
  tool: string;
}

export default function InstallPopover({
  name,
  type,
  installGuide,
  configSnippet,
  tool,
}: InstallPopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClose = useCallback(() => {
    setOpen(false);
    setCopied(false);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
  }, []);

  // ESC key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  // Click outside overlay closes
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    // Delay to prevent the same click that opened it from closing it
    setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClose]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(configSnippet);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = configSnippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      {/* Install trigger button */}
      <button
        onClick={handleButtonClick}
        className="inline-flex items-center gap-1 rounded-lg border border-navy-600 bg-navy-700/30 px-2.5 py-1 text-[11px] font-medium text-navy-300 transition-all hover:border-gold-500/40 hover:text-gold-300 hover:bg-gold-500/5"
        title="查看安装方法"
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        安装
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            ref={overlayRef}
            className="relative w-full max-w-lg rounded-xl border border-navy-600/50 bg-navy-800 shadow-2xl shadow-black/30 animate-fade-in-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy-700/50 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                  type === "Skill"
                    ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                }`}>
                  {type}
                </span>
                <span className="font-mono text-sm font-medium text-white truncate">{name}</span>
              </div>
              <button
                onClick={handleClose}
                className="shrink-0 ml-3 rounded-lg p-1.5 text-navy-400 hover:bg-navy-700 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              {/* Install guide */}
              <div>
                <h4 className="mb-1.5 text-xs font-semibold text-navy-200 uppercase tracking-wider">安装指引</h4>
                <p className="text-sm leading-relaxed text-navy-300">{installGuide}</p>
                {tool && (
                  <p className="mt-1 text-xs text-navy-400">适用工具：{tool}</p>
                )}
              </div>

              {/* Config snippet */}
              {configSnippet && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-navy-200 uppercase tracking-wider">配置</h4>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 rounded-md bg-navy-700 px-2.5 py-1 text-[10px] font-medium text-navy-300 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-lg border border-navy-600/50 bg-navy-900 p-3 overflow-x-auto">
                    <pre className="text-xs leading-relaxed text-navy-200 whitespace-pre-wrap font-mono break-all">{configSnippet}</pre>
                  </div>
                </div>
              )}

              {/* No config message */}
              {!configSnippet && (
                <div className="rounded-lg border border-navy-600/30 bg-navy-800/50 p-4 text-center">
                  <p className="text-xs text-navy-400">请在 GitHub 仓库中查看完整安装说明</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-navy-700/50 px-5 py-3">
              <p className="text-[10px] text-navy-500">
                复制配置后粘贴到 AI 工具的 MCP 设置文件中即可使用
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
