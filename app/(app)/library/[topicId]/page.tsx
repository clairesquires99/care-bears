import { parseTwee } from "@/src/mad-lib-death/parse-twee";
import topicsData from "@/src/data/topics.json";
import { Relationship, Topic } from "@/src/lib/types";
import { createClient } from "@/src/lib/supabase/server";
import fs from "fs";
import path from "path";
import TopicDetailClient from "./client";

const topics = topicsData as Topic[];

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = topics.find((t) => t.id === topicId);

  const story = topic
    ? parseTwee(
        fs.readFileSync(
          path.join(process.cwd(), "stories", topic.storyFile),
          "utf-8",
        ),
      )
    : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("relationships")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at");
  const relationships = (data ?? []) as Relationship[];

  return <TopicDetailClient topicId={topicId} story={story} relationships={relationships} userId={user?.id ?? ''} />;
}
