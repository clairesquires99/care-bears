import InteractiveStory from "@/src/mad-lib-death";
import { parseTwee } from "@/src/mad-lib-death/parse-twee";
import fs from "fs";
import path from "path";

export default function MadLibDeathPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "stories/test.twee"),
    "utf-8",
  );
  const story = parseTwee(source);
  return <InteractiveStory story={story} />;
}
