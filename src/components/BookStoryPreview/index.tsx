import type { BookSpread, BookSeg } from "@/src/data/stories/getting-to-know-me-short";

// Split segs on `br` into paragraph groups
function splitIntoParagraphs(segs: BookSeg[]): BookSeg[][] {
  const paras: BookSeg[][] = [[]];
  for (const seg of segs) {
    if (seg.t === "br") {
      paras.push([]);
    } else {
      paras[paras.length - 1].push(seg);
    }
  }
  return paras.filter((p) => p.length > 0);
}

function renderParaSegs(segs: BookSeg[], answers?: Record<string, string>) {
  return segs.map((seg, i) => {
    if (seg.t === "tx") {
      return <span key={i}>{seg.v} </span>;
    }
    if (seg.t === "it") {
      return (
        <em key={i} style={{ fontStyle: "italic", color: "#f08838" }}>
          {seg.v}{" "}
        </em>
      );
    }
    if (seg.t === "qt") {
      return (
        <span key={i} style={{ display: "block", marginBottom: "0.25em" }}>
          <em style={{ fontStyle: "italic", color: "#f08838" }}>{seg.v} </em>
          {seg.attr && (
            <span
              style={{
                display: "block",
                fontSize: "0.72em",
                fontStyle: "italic",
                color: "rgba(42,24,6,0.42)",
                marginTop: "0.12em",
                letterSpacing: "0.04em",
              }}
            >
              — {seg.attr}
            </span>
          )}
        </span>
      );
    }
    if (seg.t === "bl") {
      const filled = answers?.[seg.key];
      return (
        <span key={i}>
          {" "}
          <span
            style={{
              display: "inline-block",
              minWidth: seg.multi ? "140px" : "90px",
              borderBottom: filled
                ? "1.5px solid rgba(42,24,6,0.25)"
                : "1.5px solid rgba(42,24,6,0.35)",
              padding: "0 5px 1px",
              fontFamily: "var(--font-caveat), cursive",
              fontWeight: filled ? 600 : 500,
              fontSize: "clamp(17px, 1.9vw, 22px)",
              color: filled ? "#d8701a" : "rgba(42,24,6,0.28)",
              verticalAlign: "baseline",
              lineHeight: 1.25,
              fontStyle: seg.italic ? "italic" : undefined,
            }}
          >
            {filled ?? seg.ph}
          </span>{" "}
        </span>
      );
    }
    return null;
  });
}

export function BookStoryPreview({
  spreads,
  answers,
}: {
  spreads: BookSpread[];
  answers?: Record<string, string>;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid rgba(60,30,10,0.10)",
        boxShadow: "0 4px 24px rgba(60,30,10,0.09), 0 1px 4px rgba(60,30,10,0.06)",
        padding: "32px 36px",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "repeating-linear-gradient(transparent 0px, transparent 30px, rgba(60,30,10,0.038) 30px, rgba(60,30,10,0.038) 31px)",
        backgroundPositionY: "40px",
      }}
    >
      {/* Story title */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 400,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#d8701a",
            marginBottom: 8,
          }}
        >
          A hearth story
        </div>
        <div
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 300,
            fontSize: "clamp(22px, 2.6vw, 32px)",
            lineHeight: 1.18,
            color: "#2a1806",
          }}
        >
          Getting to Know{" "}
          <em style={{ fontStyle: "italic", color: "#f08838" }}>Me.</em>
        </div>
        <div
          style={{
            width: 32,
            height: 1,
            background: "#d8701a",
            opacity: 0.38,
            marginTop: 12,
          }}
        />
      </div>

      {/* All spreads flattened */}
      <div
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontWeight: 300,
          fontSize: "clamp(16px, 1.8vw, 20px)",
          lineHeight: 1.85,
          color: "#2a1806",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {spreads.map((spread, si) => (
          <div key={si}>
            {si > 0 && (
              <div
                style={{
                  width: "100%",
                  height: 1,
                  background: "rgba(60,30,10,0.09)",
                  margin: "4px 0 20px",
                }}
              />
            )}
            {(() => {
                const allSegs = [
                  ...(spread.L.segs ?? []),
                  ...(spread.R.segs ?? []),
                ];
                const paras = splitIntoParagraphs(allSegs);
                return paras.map((para, pi) => (
                  <p key={pi} style={{ marginBottom: pi < paras.length - 1 ? 14 : 0 }}>
                    {renderParaSegs(para, answers)}
                  </p>
                ));
              })()}
          </div>
        ))}
      </div>
    </div>
  );
}
