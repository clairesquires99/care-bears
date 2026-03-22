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

const categoryColors: Record<string, { bg: string; color: string }> = {
  "Getting to Know": { bg: "#dbeafe", color: "#1d4ed8" },
  Legacy: { bg: "#fde8c8", color: "#92400e" },
  Medical: { bg: "#dcfce7", color: "#15803d" },
  Healthcare: { bg: "#ffe4e6", color: "#e11d48" },
  Finances: { bg: "#d1fae5", color: "#059669" },
};

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
  const categoryColor = topic
    ? categoryColors[topic.category] ?? { bg: "#f6f3ef", color: "#6b5e52" }
    : { bg: "#f6f3ef", color: "#6b5e52" };

  const [showPicker, setShowPicker] = useState(false);
  const [sentCode, setSentCode] = useState<{
    code: string;
    label: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [pastConvs, setPastConvs] = useState<ConvRow[]>([]);
  const [overwriteWarning, setOverwriteWarning] = useState<{
    pendingRelationships: Relationship[];
    conflicts: { rel: Relationship; status: string }[];
  } | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const COMING_SOON_TOPICS = ["medical-emergency-planning", "finances-and-estate"];

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

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Check for existing conversations for any of the selected relationships
    const { data: existing } = await supabase
      .from("conversations")
      .select("relationship_id, status")
      .eq("topic_id", topic!.id)
      .eq("user_id", user.id)
      .in(
        "relationship_id",
        relationships.map((r) => r.id),
      );

    const conflicts = (existing ?? [])
      .map((row) => ({
        rel: relationships.find((r) => r.id === row.relationship_id)!,
        status: row.status as string,
      }))
      .filter((c) => c.rel != null);

    if (conflicts.length > 0) {
      setOverwriteWarning({ pendingRelationships: relationships, conflicts });
      return;
    }

    await doSend(relationships, supabase, user.id);
  }

  async function doSend(
    relationships: Relationship[],
    supabase: ReturnType<typeof createClient>,
    userId: string,
  ) {
    setOverwriteWarning(null);
    setSending(true);

    const codes: string[] = [];

    for (const rel of relationships) {
      const code = generateCode();
      await supabase.from("conversations").upsert(
        {
          user_id: userId,
          relationship_id: rel.id,
          topic_id: topic!.id,
          status: "sent",
          access_code: code,
          sent_at: new Date().toISOString(),
        },
        { onConflict: "user_id,topic_id,relationship_id" },
      );
      codes.push(code);
    }

    setSentCode({
      code: codes.join(", "),
      label: relationships.map((r) => r.display_name).join(", "),
    });
    setSending(false);
    fetchPastConvs();
  }

  async function handleOverwriteConfirm() {
    if (!overwriteWarning) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await doSend(overwriteWarning.pendingRelationships, supabase, user.id);
  }

  return (
    <div className="p-4 sm:p-8">
      {showPicker && (
        <RelationshipPicker
          onConfirm={handleSend}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showComingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-xl"
            style={{ background: "#ffffff" }}
          >
            <h2 className="font-bold text-lg mb-2" style={{ color: "#1a1512" }}>
              Coming soon
            </h2>
            <p className="text-sm mb-5" style={{ color: "#6b5e52" }}>
              This conversation is still being crafted. Check back soon!
            </p>
            <Button onClick={() => setShowComingSoon(false)} className="w-full" size="sm">
              Got it
            </Button>
          </div>
        </div>
      )}

      {overwriteWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-xl"
            style={{ background: "#ffffff" }}
          >
            <h2 className="font-bold text-lg mb-1" style={{ color: "#1a1512" }}>
              Already sent
            </h2>
            <p className="text-sm mb-5" style={{ color: "#6b5e52" }}>
              You&apos;ve already sent this conversation to the following{" "}
              {overwriteWarning.conflicts.length === 1 ? "person" : "people"}:
            </p>
            <div className="space-y-2 mb-5">
              {overwriteWarning.conflicts.map(({ rel, status }) => (
                <div
                  key={rel.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#f6f3ef" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: "#fbd08f", color: "#92400e" }}
                  >
                    {rel.display_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm"
                      style={{ color: "#1a1512" }}
                    >
                      {rel.display_name}
                    </p>
                    <p className="text-xs" style={{ color: "#9a8a7d" }}>
                      {statusLabel[status] ?? status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm mb-5" style={{ color: "#6b5e52" }}>
              Resending will generate a new code and reset the conversation. Any
              progress will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOverwriteWarning(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleOverwriteConfirm}
                className="flex-1"
                size="sm"
              >
                Resend
              </Button>
            </div>
          </div>
        </div>
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
                background: categoryColor.bg,
                color: categoryColor.color,
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
              onClick={() =>
                COMING_SOON_TOPICS.includes(topicId)
                  ? setShowComingSoon(true)
                  : setShowPicker(true)
              }
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
            {COMING_SOON_TOPICS.includes(topicId) ? (
              <div
                className="rounded-2xl border p-6 sm:p-8 flex items-center justify-center"
                style={{ background: "#fdfcfa", borderColor: "#e5ddd5", minHeight: "200px" }}
              >
                <p className="text-sm font-medium" style={{ color: "#9a8a7d" }}>
                  Coming soon
                </p>
              </div>
            ) : story ? (
              <>
                <p className="text-sm mb-6" style={{ color: "#9a8a7d" }}>
                  Here&apos;s a preview of how this conversation might flow. The
                  exact way the story will unfold will depend on how they answer.
                </p>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{ background: "#fdfcfa", borderColor: "#e5ddd5" }}
                >
                  <StaticStoryPreview story={story} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
