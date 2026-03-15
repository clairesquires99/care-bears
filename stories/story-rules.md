# Story Generation Rules

Use alongside `twee-writing-rules.md` for syntax guidance.

---

## What These Stories Are

Mad-lib style planning stories. The person fills in answers as they go, and those answers are woven into a final narrative — something a loved one can actually read. The story is written from the perspective of the person filling it in, using "I" and "my" throughout.

---

## Passage Length and Texture

Each passage should feel like a paragraph of a story, not a form field. Write two or three sentences of prose before presenting choices or an input. The prose should carry warmth, context, or a light touch of personality — enough that the passage has weight on its own, even before the person makes their choice.

Too thin:
> For my ashes, I'd want:
> (input-box...)

Better:
> Cremation felt right to me. I didn't want to take up much space — though I reserve the right to change my mind about that in other areas of life. As for my ashes:
> (input-box...)

The surrounding prose is what makes the final narrative feel written rather than assembled.

---

## Phrasing Choices

**When options are short words or phrases**, embed them as a mad-lib in a sentence the person is completing:

> When the time comes, I want to be [[buried->...]] [[cremated->...]] [[something else entirely->...]].

**When options are longer**, use a natural lead-in sentence and put the links on their own line. Don't force long option text into a mid-sentence slot — it breaks the sentence and looks like a UI widget:

> For the service, I had a clear preference:
> [[A formal funeral->...]]
> [[An informal gathering — a celebration of life->...]]
> [[No service at all->...]]

The test: read the passage aloud. If it sounds like something a person wrote, it's right.

---

## No Introductions

Do not open with meta-commentary ("this will take 10 minutes", "at the end you'll have..."). Drop straight into the story. The person already knows what they're doing.

---

## No Flow Control Labels

Never use "Continue", "Let's begin", "Next" as link labels. On input-box passages, the forward link label should be a short phrase that feels like the story moving — "[[On the service...->]]", "[[One more thing->]]" — or it can be omitted if another link naturally follows. Multiple-choice passages need no forward button at all.

---

## Branching

Branch when different answers lead to meaningfully different follow-up questions. Do not branch for variety. Do not react to the choice made. Just continue.

---

## Tone

Warmth and lightness where they fit naturally. Play heavy passages straight. Humour lives in the prose framing, not in responses to answers.

---

## The Final Passage

Weaves collected answers into a short readable narrative. It should feel like something left behind on purpose — not a form summary.

---

## Variable Naming

- `$camelCase` only — never `_underscore` variables
- Initialise all variables with `(set:)` in the first passage
- Use descriptive names: `$burialType`, `$favSong`, not `$a` or `$answer1`

---

## How to Generate a New Story

Provide Claude with:

1. This file (`story-rules.md`)
2. `twee-writing-rules.md`
3. A short description of the topic

Claude will generate a complete, ready-to-import `.twee` file.
