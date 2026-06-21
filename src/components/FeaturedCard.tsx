import Link from "next/link";

interface FeaturedCardProps {
  tag: string;
  tagColor: "gold" | "blue";
  title: string;
  desc: string;
  href: string;
}

export default function FeaturedCard({ tag, tagColor, title, desc, href }: FeaturedCardProps) {
  const tagClasses =
    tagColor === "gold"
      ? "bg-gold-500/10 text-gold-300 border-gold-500/30"
      : "bg-navy-500/30 text-navy-200 border-navy-500/30";

  return (
    <Link href={href} className="group block rounded-xl border border-navy-600/50 bg-navy-800/50 p-6 card-hover">
      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${tagClasses}`}>
        {tag}
      </span>
      <h3 className="mt-3 font-semibold text-white group-hover:text-gold-300 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-300">{desc}</p>
    </Link>
  );
}
