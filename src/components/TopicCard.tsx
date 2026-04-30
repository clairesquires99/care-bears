"use client";

import { Topic } from "@/src/lib/types";
import { track } from "@vercel/analytics";
import Link from "next/link";

interface TopicCardProps {
  topic: Topic;
  hasSent?: boolean;
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  "Getting to Know": { bg: "rgba(42,138,170,0.14)", color: "#2a6a8a" },
  Legacy: { bg: "rgba(200,100,26,0.15)", color: "#a8500a" },
  Medical: { bg: "rgba(82,183,136,0.18)", color: "#3a7a52" },
  Healthcare: { bg: "rgba(200,80,80,0.14)", color: "#9a4040" },
  Finances: { bg: "rgba(155,93,229,0.14)", color: "#6a3ea0" },
};

export function TopicCard({ topic, hasSent }: TopicCardProps) {
  const cat = categoryColors[topic.category] ?? {
    bg: "#f6eedb",
    color: "#9a7040",
  };

  return (
    <Link
      href={`/library/${topic.id}`}
      className="block rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: "#ffffff" }}
      onClick={() => track("story_opened", { story_id: topic.id, story_title: topic.title })}
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
            style={{ background: "#f6eedb", color: "#9a7040" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#d8701a" }}
            />
            Sent before
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: "#2a1806" }}>
        {topic.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#9a7040" }}>
        {topic.description}
      </p>
    </Link>
  );
}
