import { Topic } from "@/src/lib/types";
import Link from "next/link";

interface TopicCardProps {
  topic: Topic;
  hasSent?: boolean;
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  "Getting to Know": { bg: "#dbeafe", color: "#1d4ed8" },
  Legacy: { bg: "#fde8c8", color: "#92400e" },
  Medical: { bg: "#dcfce7", color: "#15803d" },
  Healthcare: { bg: "#ffe4e6", color: "#e11d48" },
  Finances: { bg: "#d1fae5", color: "#059669" },
};

export function TopicCard({ topic, hasSent }: TopicCardProps) {
  const cat = categoryColors[topic.category] ?? {
    bg: "#f6f3ef",
    color: "#6b5e52",
  };

  return (
    <Link
      href={`/library/${topic.id}`}
      className="block rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: "#ffffff" }}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: cat.bg, color: cat.color }}
        >
          {topic.category}
        </span>
        {hasSent && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: "#f6f3ef", color: "#9a8a7d" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#d97706" }}
            />
            Sent before
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: "#1a1512" }}>
        {topic.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#6b5e52" }}>
        {topic.description}
      </p>
    </Link>
  );
}
