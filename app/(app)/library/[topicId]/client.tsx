"use client";

import { RelationshipPicker } from "@/src/components/RelationshipPicker";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import topicsData from "@/src/data/topics.json";
import { createClient } from "@/src/lib/supabase/client";
import { Relationship, Topic } from "@/src/lib/types";
import { StaticStoryPreview } from "@/src/mad-lib-death/StaticStoryPreview";
import { TweeStory } from "@/src/mad-lib-death/parse-twee";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const topics = topicsData as Topic[];

type ConvRow = {
  id: string;
  status: string;
  sent_at: string | null;
  access_code: string | null;
  choices: number[];
  relationships: { display_name: string } | null;
};

const statusLabel: Record<string, string> = {
  sent: "Sent",
  "in-progress": "In Progress",
  completed: "Completed",
};

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function TopicDetailClient({
  topicId,
  story,
}: {
  topicId: string;
  story: TweeStory | null;
}) {
  const topic = topics.find((t) => t.id === topicId);
  const router = useRouter();

  const [showPicker, setShowPicker] = useState(false);
  const [sentCode, setSentCode] = useState<{
    code: string;
    label: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [pastConvs, setPastConvs] = useState<ConvRow[]>([]);

  async function fetchPastConvs() {
    const supabase = createClient();
    const { data } = await supabase
      .from("conversations")
      .select(
        "id, status, sent_at, access_code, choices, relationships(display_name)",
      )
      .eq("topic_id", topicId)
      .neq("status", "draft")
      .order("created_at", { ascending: false });
    setPastConvs((data as unknown as ConvRow[]) ?? []);
  }

  useEffect(() => {
    fetchPastConvs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  if (!topic) {
    return (
      <div className="p-8">
        <p style={{ color: "#6b5e52" }}>Topic not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 underline text-sm"
          style={{ color: "#d97706" }}
        >
          ← Back
        </button>
      </div>
    );
  }

  async function handleSend(relationships: Relationship[]) {
    setShowPicker(false);
    setSending(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const codes: string[] = [];

    for (const rel of relationships) {
      const code = generateCode();
      await supabase.from("conversations").insert({
        user_id: user.id,
        relationship_id: rel.id,
        topic_id: topic!.id,
        status: "sent",
        access_code: code,
        sent_at: new Date().toISOString(),
      });
      codes.push(code);
    }

    setSentCode({
      code: codes.join(", "),
      label: relationships.map((r) => r.display_name).join(", "),
    });
    setSending(false);
    fetchPastConvs();
  }

  return (
    <div className="p-4 sm:p-8">
      {showPicker && (
        <RelationshipPicker
          onConfirm={handleSend}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm"
          style={{ color: "#9a8a7d" }}
        >
          ← Library
        </button>
      </div>

      <div className="flex gap-10 flex-col lg:flex-row">
        {/* Left panel */}
        <div className="lg:w-80 lg:shrink-0">
          <div className="lg:sticky lg:top-8">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                background: "#fde8c8",
                color: "#92400e",
              }}
            >
              {topic.category}
            </span>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: "#1a1512" }}
            >
              {topic.title}
            </h1>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#6b5e52" }}
            >
              {topic.description}
            </p>

            {/* Send code toast */}
            {sentCode && (
              <div
                className="rounded-2xl p-4 mb-5 border"
                style={{ background: "#d1fae5", borderColor: "#059669" }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#059669" }}
                >
                  Sent to {sentCode.label} ✓
                </p>
                <p className="text-xs mb-2" style={{ color: "#065f46" }}>
                  Share this code with them:
                </p>
                <p
                  className="text-2xl font-bold tracking-widest"
                  style={{ color: "#1a1512" }}
                >
                  {sentCode.code}
                </p>
                <p className="text-xs mt-2" style={{ color: "#6b5e52" }}>
                  They can enter this at /parent to start the conversation.
                </p>
                <p className="text-xs mt-1" style={{ color: "#9a8a7d" }}>
                  Email sending coming soon. Share this code directly for now.
                </p>
              </div>
            )}

            <Button
              onClick={() => setShowPicker(true)}
              disabled={sending}
              className="w-full mb-3"
            >
              {sending ? "Sending..." : "▶ Send to..."}
            </Button>

            <button
              className="w-full text-sm py-2 rounded-xl border text-center"
              style={{ borderColor: "#e5ddd5", color: "#9a8a7d" }}
              onClick={() => alert("Customization coming soon.")}
            >
              ✏ Customize Prompts
            </button>

            {/* Why talk about this */}
            <div
              className="mt-6 rounded-2xl p-4"
              style={{ background: "#f6f3ef" }}
            >
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#1a1512" }}
              >
                ❓ Why Talk About This?
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#6b5e52" }}
              >
                Talking about {topic.title.toLowerCase()} is one of the most
                caring things you can do for your family. It provides clarity
                and reduces stress during difficult times, and ensures your
                loved one&apos;s wishes are honored.
              </p>
            </div>

            {/* Previously sent */}
            {pastConvs.length > 0 && (
              <div className="mt-6">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#1a1512" }}
                >
                  Previously sent
                </h3>
                <div className="space-y-2">
                  {pastConvs.map((conv) => {
                    const recipient =
                      conv.relationships?.display_name ?? "Unknown";
                    const sentDate = conv.sent_at
                      ? new Date(conv.sent_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : null;

                    return (
                      <div
                        key={conv.id}
                        className="rounded-2xl p-3 flex items-center gap-3"
                        style={{ background: "#f6f3ef" }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: "#1a1512" }}
                          >
                            {recipient}
                          </p>
                          {sentDate && (
                            <p className="text-xs" style={{ color: "#9a8a7d" }}>
                              {sentDate}
                            </p>
                          )}
                        </div>
                        <Badge
                          status={
                            conv.status as "sent" | "in-progress" | "completed"
                          }
                        >
                          {statusLabel[conv.status] ?? conv.status}
                        </Badge>
                        {conv.status === "completed" && (
                          <Link
                            href={`/conversations/${conv.id}`}
                            className="text-xs font-medium whitespace-nowrap"
                            style={{ color: "#d97706" }}
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          {story && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">💬</span>
                <h2
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ color: "#9a8a7d" }}
                >
                  Conversation Preview
                </h2>
              </div>
              <p className="text-sm mb-6" style={{ color: "#9a8a7d" }}>
                Here&apos;s a preview of how this conversation will flow. Your
                loved one will see these questions and choose their answers.
              </p>
              <div
                className="rounded-2xl border p-6 sm:p-8"
                style={{ background: "#fdfcfa", borderColor: "#e5ddd5" }}
              >
                <StaticStoryPreview story={story} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
