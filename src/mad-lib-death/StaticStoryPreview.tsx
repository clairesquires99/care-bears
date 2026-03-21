import { TweeStory } from "./parse-twee";

// ── Rich text helpers ─────────────────────────────────────────────────────────

type RichNode = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  variable?: boolean;
};

function parseRich(text: string): RichNode[] {
  const nodes: RichNode[] = [];
  const regex = /\/\/([^/]+)\/\/|''([^']+)''|\$([A-Za-z]\w*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push({ text: text.slice(last, match.index) });
    if (match[1] !== undefined) nodes.push({ text: match[1], italic: true });
    else if (match[2] !== undefined) nodes.push({ text: match[2], bold: true });
    else nodes.push({ text: "fill-in-the-blank", variable: true });
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

const VAR_RE = /\$[A-Za-z]\w*/g;
const FILL = "fill-in-the-blank";

function resolveVars(text: string) {
  return text.replace(VAR_RE, FILL);
}

function renderNode(node: RichNode, key: number) {
  if (node.variable) return <strong key={key}>{FILL}</strong>;
  if (node.bold) return <strong key={key}>{resolveVars(node.text)}</strong>;
  if (node.italic) return <em key={key}>{resolveVars(node.text)}</em>;
  return <span key={key}>{resolveVars(node.text)}</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

type Step = {
  text: string;
  choices: { label: string; target: string }[] | null;
  inputPlaceholder?: string;
};

function buildSteps(story: TweeStory): Step[] {
  const steps: Step[] = [];
  const visited = new Set<string>();
  let currentId = story.startPassage;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const passage = story.passages[currentId];
    if (!passage) break;

    const parts: string[] = [];
    let choices: { label: string; target: string }[] | null = null;

    for (const seg of passage.segments) {
      if (seg.type === "text") {
        parts.push(seg.content);
      } else if (seg.type === "choices") {
        choices = seg.links;
        break;
      } else if (seg.type === "conditional") {
        // No variables in preview — show the else branch (empty-variable state)
        parts.push(seg.elseContent ?? seg.ifContent);
      }
    }

    const text = parts
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    steps.push({ text, choices, inputPlaceholder: passage.input?.placeholder });

    if (choices && choices.length > 0) {
      currentId = choices[0].target;
    } else if (passage.input) {
      currentId = passage.input.submitTarget;
    } else {
      break;
    }
  }

  return steps;
}

export function StaticStoryPreview({ story }: { story: TweeStory }) {
  const steps = buildSteps(story);

  return (
    <div className="flex flex-col gap-8 text-lg leading-8 text-zinc-800 dark:text-zinc-200">
      {steps.map((step, i) => {
        const paragraphs = buildParagraphs(parseRich(step.text));
        return (
          <div key={i} className="opacity-70">
            {paragraphs.map((para, j) => {
              const isLast = j === paragraphs.length - 1;
              return (
                <p key={j} className={j > 0 ? "mt-4" : ""}>
                  {para.length === 0 ? <>&nbsp;</> : para.map(renderNode)}
                </p>
              );
            })}
            {step.choices && (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.choices.map((link) => (
                  <span
                    key={link.target}
                    className="inline-block rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-600"
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            )}
            {step.inputPlaceholder && (
              <div className="mt-3">
                <span className="inline-block rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-400 italic">
                  {step.inputPlaceholder}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
