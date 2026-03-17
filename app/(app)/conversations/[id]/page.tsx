import { Badge } from "@/src/components/ui/Badge";
import topicsData from "@/src/data/topics.json";
import { createClient } from "@/src/lib/supabase/server";
import { Topic } from "@/src/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

const topics = topicsData as Topic[];

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("*, relationships(*)")
    .eq("id", id)
    .single();

  if (!conv) notFound();

  const topic = topics.find((t) => t.id === conv.topic_id);
  if (!topic) notFound();

  const { data: answers } = await supabase
    .from("answers")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at");

  const relationship = conv.relationships as {
    display_name: string;
    email: string;
  } | null;

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/library"
        className="text-sm mb-6 inline-block"
        style={{ color: "#9a8a7d" }}
      >
        ← Library
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold" style={{ color: "#1a1512" }}>
            {topic.title}
          </h1>
          <Badge
            status={
              conv.status as "draft" | "sent" | "in-progress" | "completed"
            }
          >
            {conv.status}
          </Badge>
        </div>
        <div
          className="flex items-center gap-4 text-sm"
          style={{ color: "#9a8a7d" }}
        >
          {relationship && (
            <span>
              Sent to{" "}
              <strong style={{ color: "#1a1512" }}>
                {relationship.display_name}
              </strong>
            </span>
          )}
          {conv.access_code && (
            <span>
              Code:{" "}
              <code
                className="font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ background: "#fde8c8", color: "#92400e" }}
              >
                {conv.access_code}
              </code>
            </span>
          )}
          {conv.sent_at && (
            <span>Sent {new Date(conv.sent_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
