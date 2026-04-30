"use client";

import { useState } from "react";
import { Wand2, Check } from "lucide-react";
import { track } from "@vercel/analytics";
import { registerCustomStoryInterest } from "@/src/app/actions/registerCustomStoryInterest";

interface CustomStoryCardProps {
  hasRegistered: boolean;
}

export function CustomStoryCard({ hasRegistered }: CustomStoryCardProps) {
  const [registered, setRegistered] = useState(hasRegistered);
  const [pending, setPending] = useState(false);

  async function handleRegisterInterest() {
    if (registered || pending) return;
    setPending(true);
    setRegistered(true);
    track("custom_story_interest_registered");
    await registerCustomStoryInterest();
    setPending(false);
  }

  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background: "linear-gradient(135deg, #ede9fe 0%, #fef8f0 55%, #fde8c8 100%)",
        border: "2px dashed #c4b5fd",
      }}
    >
      <div className="mb-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "#7c3aed", color: "#ffffff" }}
        >
          Coming soon
        </span>
      </div>

      <div className="flex items-center gap-2.5 mb-3">
        <Wand2 size={24} color="#7c3aed" strokeWidth={2} />
        <h3 className="font-bold text-lg" style={{ color: "#4c1d95" }}>
          Create custom story
        </h3>
      </div>

      <p className="text-sm leading-relaxed mb-5" style={{ color: "#9a7040" }}>
        Have a conversation you&apos;d rather curate yourself? Use this to create a
        custom conversation guided by our custom conversation genie!
      </p>

      <div className="border-t pt-4" style={{ borderColor: "#ddd6fe" }}>
        {registered ? (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "#059669" }}
          >
            <Check size={13} />
            Thanks for registering your interest. We&apos;ll be sure to let you know
            when it&apos;s been built.
          </span>
        ) : (
          <button
            type="button"
            onClick={handleRegisterInterest}
            disabled={pending}
            className="text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "#7c3aed" }}
          >
            Interested? Let us know by clicking here
          </button>
        )}
      </div>
    </div>
  );
}
