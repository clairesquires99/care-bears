import InteractiveStory from "@/src/mad-lib-death";
import { parseTwee } from "@/src/mad-lib-death/parse-twee";
import { createClient } from "@/src/lib/supabase/server";
import topicsData from "@/src/data/topics.json";
import { Topic } from "@/src/lib/types";
import { notFound, redirect } from "next/navigation";
import fs from "fs";
import path from "path";

const topics = topicsData as Topic[];

export default async function ParentConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .neq("status", "draft")
    .single();

  if (!conv) redirect("/parent");

  const topic = topics.find((t) => t.id === conv.topic_id);
  if (!topic) notFound();

  if (conv.status === "sent") {
    await supabase
      .from("conversations")
      .update({ status: "in-progress" })
      .eq("id", conversationId);
  }

  const source = fs.readFileSync(
    path.join(process.cwd(), "stories", topic.storyFile),
    "utf-8",
  );
  const story = parseTwee(source);

  return (
    <InteractiveStory
      story={story}
      completePath={`/parent/${conversationId}/complete`}
    />
  );
}
