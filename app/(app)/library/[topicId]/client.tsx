"use client";

import { RelationshipPicker } from "@/src/components/RelationshipPicker";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import topicsData from "@/src/data/topics.json";
import { createClient } from "@/src/lib/supabase/client";
import { sendConversation } from "./actions";
import { Relationship, Topic } from "@/src/lib/types";
import { StaticStoryPreview } from "@/src/mad-lib-death/StaticStoryPreview";
import { TweeStory } from "@/src/mad-lib-death/parse-twee";
import { BookStoryPreview } from "@/src/components/BookStoryPreview";
import type { BookSpread } from "@/src/data/stories/getting-to-know-me-short";
import { track } from "@vercel/analytics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PARENT_BASE_URL = "https://app.ourhearth.co/parent";

function CopyLinkInline({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(`${PARENT_BASE_URL}?code=${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-colors whitespace-nowrap"
      style={{
        borderColor: copied ? "#059669" : "#6ee7b7",
        color: copied ? "#059669" : "#065f46",
        background: copied ? "#d1fae5" : "#f0fdf4",
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

const topics = topicsData as Topic[];

const categoryColors: Record<string, { bg: string; color: string }> = {
  "Getting to Know": { bg: "rgba(42,138,170,0.14)", color: "#2a6a8a" },
  Legacy: { bg: "rgba(200,100,26,0.15)", color: "#a8500a" },
  Medical: { bg: "rgba(82,183,136,0.18)", color: "#3a7a52" },
  Healthcare: { bg: "rgba(200,80,80,0.14)", color: "#9a4040" },
  Finances: { bg: "rgba(155,93,229,0.14)", color: "#6a3ea0" },
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
  bookSpreads,
  relationships,
  userId,
}: {
  topicId: string;
  story: TweeStory | null;
  bookSpreads?: BookSpread[] | null;
  relationships: Relationship[];
  userId: string;
}) {
  const topic = topics.find((t) => t.id === topicId);
  const router = useRouter();
  const categoryColor = topic
    ? (categoryColors[topic.category] ?? { bg: "#f6eedb", color: "#9a7040" })
    : { bg: "#f6eedb", color: "#9a7040" };

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

  const COMING_SOON_TOPICS = [
    "medical-emergency-planning",
    "finances-and-estate",
  ];

  async function fetchPastConvs() {
    if (!userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("conversations")
      .select(
        "id, status, sent_at, access_code, choices, relationships(display_name)",
      )
      .eq("topic_id", topicId)
      .eq("user_id", userId)
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
        <p style={{ color: "#9a7040" }}>Topic not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 underline text-sm"
          style={{ color: "#d8701a" }}
        >
          ← Back
        </button>
      </div>
    );
  }

  async function handleSend(rels: Relationship[]) {
    setShowPicker(false);

    // Check for existing conversations (anon policy allows this read)
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("conversations")
      .select("relationship_id, status")
      .eq("topic_id", topic!.id)
      .eq("user_id", userId)
      .in("relationship_id", rels.map((r) => r.id));

    const conflicts = (existing ?? [])
      .map((row) => ({
        rel: rels.find((r) => r.id === row.relationship_id)!,
        status: row.status as string,
      }))
      .filter((c) => c.rel != null);

    if (conflicts.length > 0) {
      setOverwriteWarning({ pendingRelationships: rels, conflicts });
      return;
    }

    await doSend(rels);
  }

  async function doSend(rels: Relationship[]) {
    setOverwriteWarning(null);
    setSending(true);

    const codes: string[] = [];

    for (const rel of rels) {
      const code = generateCode();
      await sendConversation({ relationshipId: rel.id, topicId: topic!.id, code });
      codes.push(code);
    }

    setSentCode({
      code: codes.join(", "),
      label: rels.map((r) => r.display_name).join(", "),
    });
    setSending(false);
    fetchPastConvs();
  }

  async function handleOverwriteConfirm() {
    if (!overwriteWarning) return;
    await doSend(overwriteWarning.pendingRelationships);
  }

  return (
    <div className="p-4 sm:p-8">
      {showPicker && (
        <RelationshipPicker
          onConfirm={handleSend}
          onClose={() => setShowPicker(false)}
          storyId={topicId}
          storyTitle={topic.title}
          relationships={relationships}
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
            <h2 className="font-bold text-lg mb-2" style={{ color: "#2a1806" }}>
              Coming soon
            </h2>
            <p className="text-sm mb-5" style={{ color: "#9a7040" }}>
              This conversation is still being crafted. Check back soon!
            </p>
            <Button
              onClick={() => setShowComingSoon(false)}
              className="w-full"
              size="sm"
            >
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
            <h2 className="font-bold text-lg mb-1" style={{ color: "#2a1806" }}>
              Already sent
            </h2>
            <p className="text-sm mb-5" style={{ color: "#9a7040" }}>
              You&apos;ve already sent this conversation to the following{" "}
              {overwriteWarning.conflicts.length === 1 ? "person" : "people"}:
            </p>
            <div className="space-y-2 mb-5">
              {overwriteWarning.conflicts.map(({ rel, status }) => (
                <div
                  key={rel.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#f6eedb" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: "#fbd08f", color: "#5a4030" }}
                  >
                    {rel.display_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm"
                      style={{ color: "#2a1806" }}
                    >
                      {rel.display_name}
                    </p>
                    <p className="text-xs" style={{ color: "#9a7040" }}>
                      {statusLabel[status] ?? status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm mb-5" style={{ color: "#9a7040" }}>
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
          style={{ color: "#9a7040" }}
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
              style={{ color: "#2a1806" }}
            >
              {topic.title}
            </h1>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#9a7040" }}
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
                  Share this link with your parent:
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    readOnly
                    value={`app.ourhearth.co/parent?code=${sentCode.code}`}
                    onFocus={(e) => e.target.select()}
                    className="text-xs font-mono px-2.5 py-1.5 rounded-xl border flex-1 min-w-0 outline-none cursor-text"
                    style={{ background: "#f0fdf4", borderColor: "#6ee7b7", color: "#065f46" }}
                  />
                  <CopyLinkInline code={sentCode.code} />
                </div>
                <p className="text-xs" style={{ color: "#9a7040" }}>
                  Share via WhatsApp, email, or any messaging app.
                </p>
                <p className="text-xs mt-1" style={{ color: "#9a7040" }}>
                  Or they can visit{" "}
                  <span className="font-bold">app.ourhearth.co/parent</span> and
                  enter code{" "}
                  <span className="font-bold tracking-widest">{sentCode.code}</span>.
                </p>
              </div>
            )}

            <Button
              onClick={() => {
                if (COMING_SOON_TOPICS.includes(topicId)) {
                  setShowComingSoon(true);
                } else {
                  setShowPicker(true);
                }
              }}
              disabled={sending}
              className="w-full mb-3"
            >
              {sending ? "Sending..." : "▶ Send to..."}
            </Button>

            <button
              className="w-full text-sm py-2 rounded-xl border text-center"
              style={{ borderColor: "rgba(60,30,10,0.12)", color: "#9a7040" }}
              onClick={() => alert("Customization coming soon.")}
            >
              ✏ Customize Prompts
            </button>

            {/* Why talk about this */}
            <div
              className="mt-6 rounded-2xl p-4"
              style={{ background: "#f6eedb" }}
            >
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#2a1806" }}
              >
                ❓ Why Talk About This?
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#9a7040" }}
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
                  style={{ color: "#2a1806" }}
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
                        style={{ background: "#f6eedb" }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: "#2a1806" }}
                          >
                            {recipient}
                          </p>
                          {sentDate && (
                            <p className="text-xs" style={{ color: "#9a7040" }}>
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
                            style={{ color: "#d8701a" }}
                            onClick={() => track("completed_story_viewed", { story_id: topicId, story_title: topic.title, conversation_id: conv.id })}
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
                style={{ color: "#9a7040" }}
              >
                Conversation Preview
              </h2>
            </div>
            {COMING_SOON_TOPICS.includes(topicId) ? (
              <div
                className="rounded-2xl border p-6 sm:p-8 flex items-center justify-center"
                style={{
                  background: "#fdfcfa",
                  borderColor: "rgba(60,30,10,0.12)",
                  minHeight: "200px",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "#9a7040" }}>
                  Coming soon
                </p>
              </div>
            ) : bookSpreads ? (
              <>
                <p className="text-sm mb-6" style={{ color: "#9a7040" }}>
                  Here&apos;s a preview of how this conversation might flow.
                </p>
                <BookStoryPreview spreads={bookSpreads} />
              </>
            ) : story ? (
              <>
                <p className="text-sm mb-6" style={{ color: "#9a7040" }}>
                  Here&apos;s a preview of how this conversation might flow. The
                  exact way the story will unfold will depend on how they
                  answer.
                </p>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{ background: "#fdfcfa", borderColor: "rgba(60,30,10,0.12)" }}
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
