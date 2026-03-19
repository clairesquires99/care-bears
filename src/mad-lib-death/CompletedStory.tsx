import { TweePassage, TweeStory } from "./parse-twee";

// ── Rich text helpers (mirrored from index.tsx) ───────────────────────────────

type RichNode = { text: string; bold?: boolean; italic?: boolean };

function parseRich(text: string): RichNode[] {
  const nodes: RichNode[] = [];
  const regex = /\/\/([^/]+)\/\/|''([^']+)''/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push({ text: text.slice(last, match.index) });
    if (match[1] !== undefined) nodes.push({ text: match[1], italic: true });
    else nodes.push({ text: match[2], bold: true });
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push({ text: text.slice(last) });
  return nodes;
}

function buildParagraphs(nodes: RichNode[]): RichNode[][] {
  const paragraphs: RichNode[][] = [[]];
  for (const node of nodes) {
    const parts = node.text.split("\n\n");
    parts.forEach((part, i) => {
      if (i > 0) paragraphs.push([]);
      if (part) paragraphs[paragraphs.length - 1].push({ ...node, text: part });
    });
  }
  return paragraphs;
}

function renderNode(node: RichNode, key: number) {
  if (node.bold) return <strong key={key}>{node.text}</strong>;
  if (node.italic) return <em key={key}>{node.text}</em>;
  return <span key={key}>{node.text}</span>;
}

// ── Passage text extraction ───────────────────────────────────────────────────

function getPassageText(
  passage: TweePassage,
  variables: Record<string, string>,
): { text: string; choices: { label: string; target: string }[] | null } {
  const substitute = (t: string) =>
    t.replace(/\$(\w+)/g, (_, name) => variables[name] ?? "");

  const parts: string[] = [];
  let choices: { label: string; target: string }[] | null = null;

  for (const seg of passage.segments) {
    if (seg.type === "choices") {
      choices = seg.links;
      break;
    } else if (seg.type === "text") {
      parts.push(substitute(seg.content));
    } else if (seg.type === "conditional") {
      const varVal = variables[seg.variable] ?? "";
      const condMet =
        seg.condition === "empty" ? varVal === "" : varVal !== "";
      const content = condMet ? seg.ifContent : (seg.elseContent ?? "");
      parts.push(substitute(content));
    }
  }

  return {
    text: parts.join("").replace(/\n{3,}/g, "\n\n").trim(),
    choices,
  };
}

// ── Story replay ─────────────────────────────────────────────────────────────

function replayStory(
  story: TweeStory,
  choices: number[],
): { history: { text: string; choiceLabel: string }[]; finalText: string } {
  let currentId = story.startPassage;
  const variables: Record<string, string> = {};
  const history: { text: string; choiceLabel: string }[] = [];

  for (const choiceIndex of choices) {
    const passage = story.passages[currentId];
    if (!passage) break;
    const { text, choices: links } = getPassageText(passage, variables);
    if (!links || choiceIndex >= links.length) break;
    history.push({ text, choiceLabel: links[choiceIndex].label });
    currentId = links[choiceIndex].target;
  }

  const finalPassage = story.passages[currentId];
  const { text: finalText } = finalPassage
    ? getPassageText(finalPassage, variables)
    : { text: "" };

  return { history, finalText };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CompletedStory({
  story,
  choices,
}: {
  story: TweeStory;
  choices: number[];
}) {
  const { history, finalText } = replayStory(story, choices);
  const finalParagraphs = buildParagraphs(parseRich(finalText));

  return (
    <div className="flex flex-col gap-8 text-lg leading-8 text-zinc-800 dark:text-zinc-200">
      {history.map((entry, i) => {
        const paragraphs = buildParagraphs(parseRich(entry.text));
        return (
          <div key={i} className="opacity-50">
            {paragraphs.map((para, j) => {
              const isLast = j === paragraphs.length - 1;
              return (
                <p key={j} className={j > 0 ? "mt-4" : ""}>
                  {para.length === 0 ? <>&nbsp;</> : para.map(renderNode)}
                  {isLast && (
                    <span className="ml-2 inline-block rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {entry.choiceLabel}
                    </span>
                  )}
                </p>
              );
            })}
          </div>
        );
      })}

      <div>
        {finalParagraphs.map((para, i) => (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {para.length === 0 ? <>&nbsp;</> : para.map(renderNode)}
          </p>
        ))}
      </div>
    </div>
  );
}
