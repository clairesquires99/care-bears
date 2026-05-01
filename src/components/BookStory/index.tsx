"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { BookSpread, BookSeg } from "@/src/data/stories/getting-to-know-me-short";

type Props = {
  spreads: BookSpread[];
  completePath: string;
  conversationId: string;
  initialAnswers?: Record<string, string>;
};

export default function BookStory({
  spreads,
  completePath,
  conversationId,
  initialAnswers = {},
}: Props) {
  const router = useRouter();
  const N = spreads.length;

  const [cur, setCur] = useState(0);
  const [showDone, setShowDone] = useState(false);

  const answersRef = useRef<Record<string, string>>({ ...initialAnswers });
  const busyRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Butterfly refs
  const bookRef = useRef<HTMLDivElement>(null);
  const bfRef = useRef<SVGSVGElement>(null);
  const bLURef = useRef<SVGEllipseElement>(null);
  const bLLRef = useRef<SVGEllipseElement>(null);
  const bRURef = useRef<SVGEllipseElement>(null);
  const bRLRef = useRef<SVGEllipseElement>(null);
  const bxRef = useRef(-60);
  const byRef = useRef(200);
  const btRef = useRef(0);
  const bRafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const bQueueRef = useRef<Array<{ x: number; y: number; cb?: () => void }>>([]);
  const bTargetRef = useRef<{ x: number; y: number; cb?: () => void } | null>(null);
  const bSpeedRef = useRef(5.5);

  const flapRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // ── Butterfly ─────────────────────────────────────────────────────────────

  const bFlap = useCallback((t: number) => {
    const s = 0.62 + 0.48 * Math.abs(Math.sin(t * 7.2));
    bLURef.current?.setAttribute("ry", (8 * s).toFixed(2));
    bRURef.current?.setAttribute("ry", (8 * s).toFixed(2));
    bLLRef.current?.setAttribute("ry", (5.5 * s).toFixed(2));
    bRLRef.current?.setAttribute("ry", (5.5 * s).toFixed(2));
  }, []);

  const bPlace = useCallback((x: number, y: number, facingLeft: boolean) => {
    if (!bfRef.current) return;
    bfRef.current.style.left = x - 22 + "px";
    bfRef.current.style.top = y - 18 + "px";
    bfRef.current.style.transform = facingLeft ? "scaleX(-1)" : "scaleX(1)";
  }, []);

  const bShow = useCallback((v: boolean) => {
    if (!bfRef.current) return;
    bfRef.current.style.opacity = v ? "1" : "0";
  }, []);

  const bLoop = useCallback(() => {
    btRef.current += 0.016;
    bFlap(btRef.current);

    if (!bTargetRef.current && bQueueRef.current.length > 0) {
      bTargetRef.current = bQueueRef.current.shift()!;
    }

    if (bTargetRef.current) {
      const dx = bTargetRef.current.x - bxRef.current;
      const dy = bTargetRef.current.y - byRef.current;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = bSpeedRef.current;
      if (dist < speed + 0.5) {
        bxRef.current = bTargetRef.current.x;
        byRef.current = bTargetRef.current.y;
        bTargetRef.current.cb?.();
        bTargetRef.current = null;
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        const perp = Math.sin(btRef.current * 5.5) * 3.2;
        bxRef.current += nx * speed + -ny * perp * 0.32;
        byRef.current += ny * speed + nx * perp * 0.32;
        bPlace(bxRef.current, byRef.current, dx < 0);
      }
      bRafRef.current = requestAnimationFrame(bLoop);
    } else {
      bShow(false);
    }
  }, [bFlap, bPlace, bShow]);

  const bStartReveal = useCallback(
    (waypoints: Array<{ x: number; y: number; cb?: () => void }>) => {
      if (bRafRef.current) cancelAnimationFrame(bRafRef.current);
      bQueueRef.current = waypoints.slice();
      bTargetRef.current = null;

      if (bQueueRef.current.length === 0) {
        bShow(false);
        return;
      }

      const first = bQueueRef.current[0];
      bxRef.current = -60;
      byRef.current = first.y;
      bPlace(bxRef.current, byRef.current, false);
      bShow(true);
      bRafRef.current = requestAnimationFrame(bLoop);
    },
    [bLoop, bPlace, bShow],
  );

  // ── Reveal helpers ────────────────────────────────────────────────────────

  const revealInstant = useCallback(() => {
    if (!bookRef.current) return;
    const els = Array.from(
      bookRef.current.querySelectorAll<HTMLElement>(".hb-word, .hb-blank"),
    );
    els.forEach((el, i) => {
      setTimeout(() => el.classList.add("hb-on"), i * 28);
    });
  }, []);

  const revealWithButterfly = useCallback(
    (onDone?: () => void) => {
      if (!bookRef.current) return;
      const bookRect = bookRef.current.getBoundingClientRect();
      const els = Array.from(
        bookRef.current.querySelectorAll<HTMLElement>(".hb-word, .hb-blank"),
      ).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      if (!els.length) {
        onDone?.();
        return;
      }

      const waypoints: Array<{ x: number; y: number; cb?: () => void }> = [];
      const firstR = els[0].getBoundingClientRect();
      waypoints.push({
        x: firstR.left - bookRect.left - 55,
        y: firstR.top - bookRect.top + firstR.height * 0.5,
      });

      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        waypoints.push({
          x: r.left - bookRect.left + r.width * 0.45,
          y: r.top - bookRect.top + r.height * 0.5,
          cb: () => el.classList.add("hb-on"),
        });
      });

      const lastR = els[els.length - 1].getBoundingClientRect();
      waypoints.push({
        x: lastR.right - bookRect.left + 80,
        y: lastR.top - bookRect.top + lastR.height * 0.5,
        cb: onDone,
      });

      bStartReveal(waypoints);
    },
    [bStartReveal],
  );

  // ── First-load reveal ─────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(revealInstant, 100);
    return () => clearTimeout(t);
    // only on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Supabase save ─────────────────────────────────────────────────────────

  const saveProgress = useCallback(
    async (status?: string) => {
      await supabase
        .from("conversations")
        .update({ variables: answersRef.current, status: status ?? "in-progress" })
        .eq("id", conversationId);
    },
    [conversationId, supabase],
  );

  // ── Page turn ─────────────────────────────────────────────────────────────

  const goTo = useCallback(
    (idx: number) => {
      if (busyRef.current || idx === cur || idx < 0 || idx >= N) return;
      busyRef.current = true;
      isNavigatingRef.current = true;

      if (bRafRef.current) cancelAnimationFrame(bRafRef.current);
      bShow(false);

      const isForward = idx > cur;
      const flap = flapRef.current;
      if (flap) {
        flap.style.transition = "none";
        flap.style.opacity = "1";
        flap.style.transform = isForward
          ? "perspective(1100px) rotateY(0deg)"
          : "perspective(1100px) rotateY(-175deg)";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            flap.style.transition =
              "transform 0.52s cubic-bezier(0.42,0,0.22,1), opacity 0.52s";
            flap.style.transform = isForward
              ? "perspective(1100px) rotateY(-175deg)"
              : "perspective(1100px) rotateY(0deg)";
            flap.style.opacity = "0";
          });
        });
      }

      setTimeout(() => {
        if (flap) {
          flap.style.opacity = "0";
          flap.style.transition = "none";
        }
        setCur(idx);
        saveProgress();
        setTimeout(() => {
          revealWithButterfly(() => {
            busyRef.current = false;
            isNavigatingRef.current = false;
          });
        }, 120);
      }, 560);
    },
    [cur, N, bShow, saveProgress, revealWithButterfly],
  );

  const handleNext = useCallback(() => {
    if (cur >= N - 1) {
      saveProgress("completed").then(() => setShowDone(true));
    } else {
      goTo(cur + 1);
    }
  }, [cur, N, goTo, saveProgress]);

  const handleExit = useCallback(() => router.push(completePath), [router, completePath]);

  const handleRestart = useCallback(() => {
    if (bRafRef.current) cancelAnimationFrame(bRafRef.current);
    bShow(false);
    busyRef.current = false;
    setShowDone(false);
    setCur(0);
    setTimeout(revealInstant, 120);
  }, [bShow, revealInstant]);

  const handlePrev = useCallback(() => goTo(cur - 1), [cur, goTo]);

  // ── Keyboard nav ──────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active?.contentEditable === "true") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") handleNext();
      if (e.key === "ArrowLeft" || e.key === "PageUp") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (bRafRef.current) cancelAnimationFrame(bRafRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // ── Blank handler ─────────────────────────────────────────────────────────

  const handleBlankInput = useCallback(
    (key: string, el: HTMLElement) => {
      answersRef.current = {
        ...answersRef.current,
        [key]: el.textContent?.trim() ?? "",
      };
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveProgress(), 800);
    },
    [saveProgress],
  );

  // ── Render segments ───────────────────────────────────────────────────────

  const renderSegs = (segs: BookSeg[], side: "L" | "R") => {
    const nodes: React.ReactNode[] = [];
    segs.forEach((seg, i) => {
      const prefix = `${cur}-${side}-${i}`;
      if (seg.t === "br") {
        nodes.push(
          <span key={prefix} style={{ display: "block", height: "0.7em" }} />,
        );
      } else if (seg.t === "tx") {
        seg.v
          .trim()
          .split(/\s+/)
          .forEach((word, j) => {
            nodes.push(
              <span key={`${prefix}-${j}`} className="hb-word">
                {word}{" "}
              </span>,
            );
          });
      } else if (seg.t === "it") {
        seg.v
          .trim()
          .split(/\s+/)
          .forEach((word, j) => {
            nodes.push(
              <em
                key={`${prefix}-${j}`}
                className="hb-word"
                style={{ fontStyle: "italic", color: "#f08838" }}
              >
                {word}{" "}
              </em>,
            );
          });
      } else if (seg.t === "bl") {
        const initVal = answersRef.current[seg.key] ?? "";
        nodes.push(
          <span
            key={prefix}
            className="hb-blank"
            contentEditable
            suppressContentEditableWarning
            data-ph={seg.ph}
            spellCheck={false}
            style={{
              display: "inline-block",
              minWidth: seg.multi ? "160px" : "110px",
              maxWidth: "100%",
              borderBottom: "1.8px solid #2a1806",
              padding: "0 6px 1px",
              fontFamily: "var(--font-caveat), cursive",
              fontWeight: 500,
              fontSize: "clamp(19px, 2.2vw, 26px)",
              color: "#d8701a",
              outline: "none",
              verticalAlign: "baseline",
              lineHeight: 1.25,
              cursor: "text",
              fontStyle: seg.italic ? "italic" : undefined,
            }}
            ref={(el) => {
              if (el && !el.textContent && initVal) {
                el.textContent = initVal;
              }
            }}
            onInput={(e) => handleBlankInput(seg.key, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !seg.multi) e.preventDefault();
              e.stopPropagation();
            }}
          />,
        );
      }
    });
    return nodes;
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  const spread = spreads[cur];

  return (
    <>
      <style>{`
        .hb-word { display: inline; opacity: 0; }
        .hb-word.hb-on { opacity: 1; animation: hb-inkBloom 0.28s ease forwards; }
        .hb-blank { opacity: 0; transition: opacity 0.3s ease; }
        .hb-blank.hb-on { opacity: 1; }
        @keyframes hb-inkBloom {
          0%   { opacity: 0; filter: blur(1.5px); transform: scale(0.92); }
          60%  { opacity: 1; filter: blur(0); transform: scale(1.03); }
          100% { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        .hb-blank:empty::before {
          content: attr(data-ph);
          color: rgba(42,24,6,0.22);
          font-weight: 400;
          pointer-events: none;
        }
        .hb-blank:focus { border-bottom-width: 2px; border-bottom-color: #d8701a; }
        .hb-page::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            transparent 0px, transparent 30px,
            rgba(60,30,10,0.042) 30px, rgba(60,30,10,0.042) 31px
          );
          background-position: 0 54px;
        }
        .hb-page-l::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to right, rgba(60,30,10,0.055) 0%, transparent 20%);
        }
        .hb-page-r::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to left, rgba(60,30,10,0.045) 0%, transparent 20%);
        }
      `}</style>

      <div
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#ddd0b5",
          backgroundImage:
            "radial-gradient(ellipse at 28% 38%, rgba(200,110,20,0.14) 0%, transparent 52%), radial-gradient(ellipse at 73% 66%, rgba(160,80,20,0.10) 0%, transparent 48%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontWeight: 300,
        }}
      >
        {/* Nav */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 300,
            padding: "13px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(to bottom, rgba(248,236,211,0.93) 0%, transparent 100%)",
            backdropFilter: "blur(5px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 300,
              fontSize: 20,
              letterSpacing: "0.14em",
              color: "#2a1806",
            }}
          >
            hearth
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "#d8701a",
            }}
          >
            Getting to Know Me
          </div>
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              pointerEvents: "auto",
            }}
          >
            {spreads.map((_, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  cursor: "pointer",
                  background:
                    i === cur
                      ? "#d8701a"
                      : i < cur
                        ? "#9a7040"
                        : "rgba(60,30,10,0.18)",
                  opacity: i === cur ? 1 : i < cur ? 0.45 : 1,
                  transform: i === cur ? "scale(1.5)" : "scale(1)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Book */}
        <div
          ref={bookRef}
          style={{
            position: "relative",
            width: "min(95vw, 1040px)",
            height: "min(87vh, 644px)",
            filter: "drop-shadow(0 18px 56px rgba(60,30,10,0.24))",
          }}
        >
          {/* Left page */}
          <div
            className="hb-page hb-page-l"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "50%",
              overflow: "hidden",
              borderRadius: "5px 0 0 5px",
              background: "#fdf5e4",
              boxShadow:
                "inset -10px 0 26px rgba(60,30,10,0.10), -2px 0 10px rgba(60,30,10,0.07)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: "44px 46px 80px",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: cur === 0 ? "flex-start" : "center",
              }}
            >
              {cur === 0 && (
                <>
                  <div
                    style={{
                      fontSize: "9.5px",
                      fontWeight: 400,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "#d8701a",
                      marginBottom: 10,
                    }}
                  >
                    A hearth story
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontWeight: 300,
                      fontSize: "clamp(28px, 3.3vw, 40px)",
                      lineHeight: 1.18,
                      color: "#2a1806",
                      marginBottom: 14,
                    }}
                  >
                    Getting to Know{" "}
                    <em style={{ fontStyle: "italic", color: "#f08838" }}>
                      Me.
                    </em>
                  </div>
                  <div
                    style={{
                      width: 38,
                      height: 1,
                      background: "#d8701a",
                      opacity: 0.38,
                      marginBottom: 20,
                    }}
                  />
                  <div style={{ height: 18 }} />
                </>
              )}
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontWeight: 300,
                  fontSize: "clamp(17px, 2.0vw, 22px)",
                  lineHeight: 1.9,
                  color: "#2a1806",
                  overflow: "hidden",
                }}
              >
                <p>{renderSegs(spread.L.segs ?? [], "L")}</p>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 46,
                fontSize: "9.5px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9a7040",
                opacity: 0.38,
              }}
            >
              · {cur * 2 + 1} ·
            </div>
          </div>

          {/* Right page */}
          <div
            className="hb-page hb-page-r"
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              height: "100%",
              width: "50%",
              overflow: "hidden",
              borderRadius: "0 5px 5px 0",
              background: "#f5e9d2",
              boxShadow:
                "inset 10px 0 26px rgba(60,30,10,0.08), 2px 0 10px rgba(60,30,10,0.05)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: "44px 46px 80px",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontWeight: 300,
                  fontSize: "clamp(17px, 2.0vw, 22px)",
                  lineHeight: 1.9,
                  color: "#2a1806",
                  overflow: "hidden",
                }}
              >
                <p>{renderSegs(spread.R.segs ?? [], "R")}</p>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 18,
                right: 46,
                fontSize: "9.5px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9a7040",
                opacity: 0.38,
              }}
            >
              · {cur * 2 + 2} ·
            </div>
          </div>

          {/* Spine */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: 28,
              transform: "translateX(-50%)",
              background:
                "linear-gradient(to right, rgba(60,30,10,0.20) 0%, rgba(60,30,10,0.27) 36%, rgba(60,30,10,0.25) 52%, rgba(60,30,10,0.10) 72%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />

          {/* Butterfly SVG */}
          <svg
            ref={bfRef}
            style={{
              position: "absolute",
              zIndex: 50,
              pointerEvents: "none",
              width: 44,
              height: 36,
              opacity: 0,
              transition: "opacity 0.4s",
              willChange: "left, top",
            }}
            viewBox="0 0 44 36"
            fill="none"
          >
            <ellipse
              ref={bLURef}
              cx="13"
              cy="12"
              rx="11.5"
              ry="8"
              fill="#d8701a"
              opacity="0.84"
              transform="rotate(-20 13 12)"
            />
            <ellipse
              ref={bLLRef}
              cx="10.5"
              cy="23"
              rx="8"
              ry="5.5"
              fill="#f08838"
              opacity="0.70"
              transform="rotate(14 10.5 23)"
            />
            <ellipse
              ref={bRURef}
              cx="31"
              cy="12"
              rx="11.5"
              ry="8"
              fill="#d8701a"
              opacity="0.84"
              transform="rotate(20 31 12)"
            />
            <ellipse
              ref={bRLRef}
              cx="33.5"
              cy="23"
              rx="8"
              ry="5.5"
              fill="#f08838"
              opacity="0.70"
              transform="rotate(-14 33.5 23)"
            />
            <ellipse
              cx="22"
              cy="18"
              rx="2.1"
              ry="8.2"
              fill="#2a1806"
              opacity="0.78"
            />
            <path
              d="M22 10.5 Q18 4 15 2"
              stroke="#2a1806"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.52"
            />
            <path
              d="M22 10.5 Q26 4 29 2"
              stroke="#2a1806"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.52"
            />
            <circle cx="14.5" cy="1.8" r="1.3" fill="#2a1806" opacity="0.42" />
            <circle cx="29.5" cy="1.8" r="1.3" fill="#2a1806" opacity="0.42" />
          </svg>

          {/* Flap (page turn animation) */}
          <div
            ref={flapRef}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "50%",
              borderRadius: "0 5px 5px 0",
              background: "#f5e9d2",
              backgroundImage:
                "repeating-linear-gradient(transparent 0px, transparent 30px, rgba(60,30,10,0.04) 30px, rgba(60,30,10,0.04) 31px)",
              backgroundPositionY: "54px",
              transformOrigin: "left center",
              transform: "perspective(1100px) rotateY(0deg)",
              zIndex: 30,
              opacity: 0,
              pointerEvents: "none",
            }}
          />

          {/* Completion overlay */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: "50%",
              height: "100%",
              borderRadius: "0 5px 5px 0",
              background: "#f5e9d2",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "48px 44px",
              zIndex: 60,
              opacity: showDone ? 1 : 0,
              pointerEvents: showDone ? "auto" : "none",
              transition: "opacity 0.7s",
            }}
          >
            <div style={{ opacity: 0.13, marginBottom: 24 }}>
              <svg width="52" height="42" viewBox="0 0 44 36" fill="none">
                <ellipse
                  cx="13"
                  cy="12"
                  rx="11.5"
                  ry="8"
                  fill="#d8701a"
                  opacity="0.84"
                  transform="rotate(-20 13 12)"
                />
                <ellipse
                  cx="10.5"
                  cy="23"
                  rx="8"
                  ry="5.5"
                  fill="#f08838"
                  opacity="0.70"
                  transform="rotate(14 10.5 23)"
                />
                <ellipse
                  cx="31"
                  cy="12"
                  rx="11.5"
                  ry="8"
                  fill="#d8701a"
                  opacity="0.84"
                  transform="rotate(20 31 12)"
                />
                <ellipse
                  cx="33.5"
                  cy="23"
                  rx="8"
                  ry="5.5"
                  fill="#f08838"
                  opacity="0.70"
                  transform="rotate(-14 33.5 23)"
                />
                <ellipse
                  cx="22"
                  cy="18"
                  rx="2.1"
                  ry="8.2"
                  fill="#2a1806"
                  opacity="0.78"
                />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontWeight: 300,
                fontSize: "clamp(22px, 2.8vw, 34px)",
                lineHeight: 1.22,
                color: "#2a1806",
                marginBottom: 14,
              }}
            >
              And now you know me —
              <br />
              <em style={{ fontStyle: "italic", color: "#f08838" }}>
                really know me.
              </em>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#9a7040",
                lineHeight: 1.8,
                maxWidth: 280,
              }}
            >
              These answers are yours to keep. Come back any time — they&apos;ll
              be right here.
            </p>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
                maxWidth: 220,
              }}
            >
              <button
                onClick={handleExit}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  background: "#d8701a",
                  border: "none",
                  borderRadius: 6,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 11,
                  fontWeight: 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#fff",
                  cursor: "pointer",
                  opacity: 0.9,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}
              >
                Exit
              </button>
              <button
                onClick={handleRestart}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  background: "none",
                  border: "1.5px solid rgba(42,24,6,0.18)",
                  borderRadius: 6,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 11,
                  fontWeight: 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9a7040",
                  cursor: "pointer",
                  opacity: 0.75,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.75")}
              >
                Start over
              </button>
            </div>
          </div>

          {/* Prev button */}
          {cur > 0 && (
            <button
              onClick={handlePrev}
              style={{
                position: "absolute",
                bottom: 16,
                left: 26,
                zIndex: 100,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9a7040",
                opacity: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 4px",
                transition: "opacity 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.color = "#d8701a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.5";
                e.currentTarget.style.color = "#9a7040";
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8.5 1.5L3.5 6.5l5 5" />
              </svg>
              previous
            </button>
          )}

          {/* Next button */}
          {!showDone && (
            <button
              onClick={handleNext}
              style={{
                position: "absolute",
                bottom: 16,
                right: 26,
                zIndex: 100,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9a7040",
                opacity: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 4px",
                transition: "opacity 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.color = "#d8701a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.5";
                e.currentTarget.style.color = "#9a7040";
              }}
            >
              {cur >= N - 1 ? "finish" : "next"}
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4.5 1.5l5 5-5 5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
