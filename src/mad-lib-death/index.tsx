"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChoiceSegment, parseTemplate } from "./parse-template";

const CHARS_PER_SECOND = 100;

type InlineItem =
  | { type: "text"; content: string }
  | { type: "answer"; value: string };

type ParagraphLine = InlineItem[];

function buildParagraphs(inlineItems: InlineItem[]): ParagraphLine[] {
  const lines: ParagraphLine[] = [[]];
  for (const item of inlineItems) {
    if (item.type === "answer") {
      lines[lines.length - 1].push(item);
    } else {
      const parts = item.content.split("\n");
      parts.forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part) lines[lines.length - 1].push({ type: "text", content: part });
      });
    }
  }
  return lines;
}

export default function MadLibDeath({ template }: { template: string }) {
  const segments = useMemo(() => parseTemplate(template), [template]);
  const [segIndex, setSegIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [waiting, setWaiting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (waiting || segIndex >= segments.length) return;

    const seg = segments[segIndex];

    if (seg.type !== "text") {
      setWaiting(true);
      return;
    }

    setCharIndex(0);
    let char = 0;

    const interval = setInterval(() => {
      char++;
      setCharIndex(char);
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      if (char >= seg.content.length) {
        clearInterval(interval);
        setSegIndex((si) => si + 1);
      }
    }, 1000 / CHARS_PER_SECOND);

    return () => clearInterval(interval);
  }, [segIndex, waiting, segments]);

  function handleChoice(value: string) {
    setAnswers((prev) => ({ ...prev, [segIndex]: value }));
    setWaiting(false);
    setSegIndex((si) => si + 1);
  }

  function handleInput() {
    if (!inputValue.trim()) return;
    setAnswers((prev) => ({ ...prev, [segIndex]: inputValue.trim() }));
    setInputValue("");
    setWaiting(false);
    setSegIndex((si) => si + 1);
  }

  const inlineItems: InlineItem[] = [];
  segments.slice(0, segIndex).forEach((seg, i) => {
    if (seg.type === "text") {
      inlineItems.push({ type: "text", content: seg.content });
    } else {
      inlineItems.push({ type: "answer", value: answers[i] ?? "" });
    }
  });
  if (segments[segIndex]?.type === "text") {
    inlineItems.push({
      type: "text",
      content: segments[segIndex].content.slice(0, charIndex),
    });
  }

  const paragraphLines = buildParagraphs(inlineItems);
  const currentSeg = segments[segIndex];

  return (
    <main
      ref={containerRef}
      className="h-screen overflow-y-auto bg-white px-8 py-16 dark:bg-black"
    >
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-4 text-lg leading-8 text-zinc-800 dark:text-zinc-200">
          {paragraphLines.map((line, i) => {
            const isLast = i === paragraphLines.length - 1;
            return (
              <p key={i}>
                {line.length === 0 ? (
                  <>&nbsp;</>
                ) : (
                  line.map((item, j) =>
                    item.type === "text" ? (
                      <span key={j}>{item.content}</span>
                    ) : (
                      <span
                        key={j}
                        className="mx-1 inline-block rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-sm text-zinc-700"
                      >
                        {item.value}
                      </span>
                    )
                  )
                )}
                {isLast && waiting && currentSeg?.type === "choice" && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex flex-wrap gap-2 ml-1"
                    >
                      {(currentSeg as ChoiceSegment).options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleChoice(opt)}
                          className="rounded-full border border-zinc-300 bg-zinc-100 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-200"
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.span>
                  </AnimatePresence>
                )}
                {isLast && waiting && currentSeg?.type === "input" && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex gap-2 ml-1"
                    >
                      <input
                        autoFocus
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInput()}
                        className="rounded-full border border-zinc-300 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                        placeholder="type your answer..."
                      />
                      <button
                        onClick={handleInput}
                        className="rounded-full border border-zinc-300 bg-zinc-100 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-200"
                      >
                        OK
                      </button>
                    </motion.span>
                  </AnimatePresence>
                )}
              </p>
            );
          })}
        </div>
      </div>
    </main>
  );
}
