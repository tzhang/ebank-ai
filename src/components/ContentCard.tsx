import Link from "next/link";

interface ContentCardProps {
  title: string;
  desc: string;
  difficulty: "初级" | "中级" | "高级";
  href: string;
}

export default function ContentCard({ title, desc, difficulty, href }: ContentCardProps) {
  const diffColor =
    difficulty === "初级"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : difficulty === "中级"
      ? "bg-gold-500/10 text-gold-300 border-gold-500/30"
      : "bg-rose-500/10 text-rose-300 border-rose-500/30";

  const diffLabel = { "初级": "入门", "中级": "进阶", "高级": "高级" };

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-navy-600/50 bg-navy-800/50 p-6 card-hover"
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diffColor}`}>
          {diffLabel[difficulty]}
        </span>
        <svg className="h-4 w-4 text-navy-500 transition-all group-hover:translate-x-0.5 group-hover:text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <h3 className="mt-3 font-semibold text-white group-hover:text-gold-300 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-300">{desc}</p>
    </Link>
  );
}
