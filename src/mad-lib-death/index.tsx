"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CHARS_PER_SECOND = 100;

export default function MadLibDeath({ template }: { template: string }) {
  const [displayed, setDisplayed] = useState("");
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDisplayed("");
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayed(template.slice(0, index));
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      if (index >= template.length) clearInterval(interval);
    }, 1000 / CHARS_PER_SECOND);

    return () => clearInterval(interval);
  }, [template]);

  const paragraphs = displayed.split("\n");

  return (
    <main ref={containerRef} className="h-screen overflow-y-auto bg-white px-8 py-16 dark:bg-black">
      <div className="mx-auto max-w-2xl">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 text-lg leading-8 text-zinc-800 dark:text-zinc-200"
          >
            {paragraphs.map((para, i) => (
              <p key={i}>{para || <>&nbsp;</>}</p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
