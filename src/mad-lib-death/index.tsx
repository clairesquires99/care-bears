"use client";

import { Button } from "@/src/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StoryTag } from "../components/StoryTag";
import { TweeLink, TweeStory } from "./parse-twee";

const CHARS_PER_SECOND = 150;

// ── Rich text helpers ────────────────────────────────────────────────────────

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

function sliceRich(nodes: RichNode[], charIndex: number): RichNode[] {
  const result: RichNode[] = [];
  let remaining = charIndex;
  for (const node of nodes) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, node.text.length);
    result.push({ ...node, text: node.text.slice(0, take) });
    remaining -= take;
  }
  return result;
}

type Paragraph = RichNode[];

function buildParagraphs(nodes: RichNode[]): Paragraph[] {
  const paragraphs: Paragraph[] = [[]];
  for (const node of nodes) {
    const parts = node.text.split("\n\n");
    parts.forEach((part, i) => {
      if (i > 0) paragraphs.push([]);
      if (part) paragraphs[paragraphs.length - 1].push({ ...node, text: part });
    });
  }
  return paragraphs;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function renderNode(node: RichNode, key: number) {
  if (node.bold) return <strong key={key}>{node.text}</strong>;
  if (node.italic) return <em key={key}>{node.text}</em>;
  return <span key={key}>{node.text}</span>;
}

function FrozenPassage({
  text,
  choiceLabel,
}: {
  text: string;
  choiceLabel: string;
}) {
  const paragraphs = buildParagraphs(parseRich(text));
  return (
    <div className="opacity-50">
      {paragraphs.map((para, i) => {
        const isLast = i === paragraphs.length - 1;
        return (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {para.length === 0 ? <>&nbsp;</> : para.map(renderNode)}
            {isLast && (
              <span className="ml-2 inline-block rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {choiceLabel}
              </span>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

type HistoryEntry = { text: string; choiceLabel: string };

export default function InteractiveStory({
  story,
  completePath,
}: {
  story: TweeStory;
  completePath?: string;
}) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentId, setCurrentId] = useState(story.startPassage);
  const [charIndex, setCharIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLElement>(null);

  const currentPassage = story.passages[currentId];

  // Resolve text segments up to (but not including) the first choices segment.
  // Also extract the choices links if present.
  const { beforeText, passageChoices } = useMemo(() => {
    const substitute = (t: string) =>
      t.replace(/\$(\w+)/g, (_, name) => variables[name] ?? "");

    const parts: string[] = [];
    let choices: TweeLink[] | null = null;

    for (const seg of currentPassage.segments) {
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
      beforeText: parts
        .join("")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
      passageChoices: choices,
    };
  }, [currentPassage, variables]);

  const richNodes = useMemo(() => parseRich(beforeText), [beforeText]);

  const totalChars = useMemo(
    () => richNodes.reduce((s, n) => s + n.text.length, 0),
    [richNodes],
  );

  const animating = charIndex < totalChars;

  // Character-by-character animation
  useEffect(() => {
    if (charIndex >= totalChars) return;
    const id = setTimeout(() => {
      setCharIndex((c) => c + 1);
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 1000 / CHARS_PER_SECOND);
    return () => clearTimeout(id);
  }, [charIndex, totalChars]);

  function navigate(
    choiceLabel: string,
    target: string,
    newVars?: Record<string, string>,
  ) {
    setHistory((h) => [...h, { text: beforeText, choiceLabel }]);
    if (newVars) setVariables((v) => ({ ...v, ...newVars }));
    setCurrentId(target);
    setCharIndex(0);
    setInputValue("");
  }

  function handleInput() {
    const inp = currentPassage.input;
    if (!inp || !inputValue.trim()) return;
    const value = inputValue.trim();
    navigate(value, inp.submitTarget, { [inp.variable]: value });
  }

  const router = useRouter();

  const displayNodes = animating ? sliceRich(richNodes, charIndex) : richNodes;
  const paragraphs = buildParagraphs(displayNodes);
  const showChoices = !animating && passageChoices !== null;
  const showInput = !animating && !!currentPassage.input;
  const showFinish =
    !animating && !passageChoices && !currentPassage.input && !!completePath;

  return (
    <main
      ref={containerRef}
      className="h-screen overflow-y-auto bg-white px-8 py-16 dark:bg-black"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Button variant="muted" size="sm" onClick={() => router.back()}>
            ✕ Quit
          </Button>
        </div>
        <div className="flex flex-col gap-8 text-lg leading-8 text-zinc-800 dark:text-zinc-200">
          {history.map((entry, i) => (
            <FrozenPassage
              key={i}
              text={entry.text}
              choiceLabel={entry.choiceLabel}
            />
          ))}

          <div>
            {paragraphs.map((para, i) => {
              const isLast = i === paragraphs.length - 1;
              return (
                <p key={i} className={i > 0 ? "mt-4" : ""}>
                  {para.length === 0 ? <>&nbsp;</> : para.map(renderNode)}
                  {isLast && showChoices && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="ml-2 inline-flex flex-wrap gap-2"
                      >
                        {passageChoices!.map((link) => (
                          <StoryTag
                            key={link.target}
                            onClick={() => navigate(link.label, link.target)}
                          >
                            {link.label}
                          </StoryTag>
                        ))}
                      </motion.span>
                    </AnimatePresence>
                  )}
                  {isLast && showInput && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="ml-1 inline-flex gap-2"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleInput()}
                          className="rounded-full border border-zinc-300 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                          placeholder={currentPassage.input!.placeholder}
                        />
                        <StoryTag onClick={handleInput}>
                          {currentPassage.input!.submitLabel}
                        </StoryTag>
                      </motion.span>
                    </AnimatePresence>
                  )}
                </p>
              );
            })}
          </div>

          {showFinish && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-end"
              >
                <Button href={completePath}>Finish</Button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
}
