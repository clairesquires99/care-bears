export type PassageSegment =
  | { type: 'text'; content: string }
  | { type: 'choices'; links: TweeLink[] }
  | {
      type: 'conditional'
      variable: string
      condition: 'empty' | 'not-empty'
      ifContent: string
      elseContent?: string
    }

export type TweeLink = { label: string; target: string }

export type TweeInput = {
  variable: string
  placeholder: string
  submitLabel: string
  submitTarget: string
}

export type TweePassage = {
  name: string
  segments: PassageSegment[]
  input?: TweeInput
}

export type TweeStory = {
  startPassage: string
  passages: Record<string, TweePassage>
}

export function parseTwee(source: string): TweeStory {
  const rawPassages = source.split(/^:: /m).filter(Boolean)
  let startPassage = 'Start'
  const passages: Record<string, TweePassage> = {}

  for (const raw of rawPassages) {
    const newlineIdx = raw.indexOf('\n')
    const name = raw.slice(0, newlineIdx).trim()
    let content = raw.slice(newlineIdx + 1)

    if (name === 'StoryTitle') continue
    if (name === 'StoryData') {
      const m = content.match(/"start":\s*"([^"]+)"/)
      if (m) startPassage = m[1]
      continue
    }

    // Strip (set: ...) directives
    content = content.replace(/\(set:[^)]+\)/g, '')

    const hasInputBox = /\(input-box:/.test(content)

    if (hasInputBox) {
      // Input passage: extract input-box and its submit link, parse rest as text
      let input: TweeInput | undefined

      content = content.replace(
        /\(input-box:\s*bind\s*\$(\w+),\s*"[^"]*",\s*\d+,\s*"([^"]*)"\)/g,
        (_, variable, placeholder) => {
          input = { variable, placeholder, submitLabel: '', submitTarget: '' }
          return ''
        },
      )

      // (link-goto: ...) as submit
      content = content.replace(
        /\(link-goto:\s*"([^"]+)",\s*"([^"]+)"\)/g,
        (_, label, target) => {
          if (input && !input.submitLabel) {
            input.submitLabel = label
            input.submitTarget = target
          }
          return ''
        },
      )

      // First [[link]] after input-box as submit
      content = content.replace(/\[\[([^\]]+)->([^\]]+)\]\]/g, (_, label, target) => {
        if (input && !input.submitLabel) {
          input.submitLabel = label.trim()
          input.submitTarget = target.trim()
        }
        return ''
      })

      passages[name] = { name, segments: parseConditionals(content), input }
    } else {
      // Non-input passage: parse links at their position as inline choices
      passages[name] = { name, segments: parseWithInlineChoices(content) }
    }
  }

  return { startPassage, passages }
}

// Parse content that has no input-box: links become inline choices at their position
function parseWithInlineChoices(content: string): PassageSegment[] {
  // Find all link match positions
  const linkRegex = /\[\[([^\]]+)->([^\]]+)\]\]/g
  const linkMatches: { index: number; end: number; link: TweeLink }[] = []
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(content)) !== null) {
    linkMatches.push({
      index: match.index,
      end: linkRegex.lastIndex,
      link: { label: match[1].trim(), target: match[2].trim() },
    })
  }

  if (linkMatches.length === 0) return parseConditionals(content)

  // Group consecutive links (only whitespace between them)
  const groups: { start: number; end: number; links: TweeLink[] }[] = []
  let current: (typeof groups)[0] | null = null

  for (const m of linkMatches) {
    if (!current) {
      current = { start: m.index, end: m.end, links: [m.link] }
    } else {
      const between = content.slice(current.end, m.index)
      if (/^\s*$/.test(between)) {
        current.end = m.end
        current.links.push(m.link)
      } else {
        groups.push(current)
        current = { start: m.index, end: m.end, links: [m.link] }
      }
    }
  }
  if (current) groups.push(current)

  // Build segments: text before each group → choices
  const segments: PassageSegment[] = []
  let lastEnd = 0

  for (const group of groups) {
    const textBefore = content.slice(lastEnd, group.start)
    if (textBefore.trim()) segments.push(...parseConditionals(textBefore))
    segments.push({ type: 'choices', links: group.links })
    lastEnd = group.end
  }

  // Text after last group (usually just punctuation — kept for completeness)
  const textAfter = content.slice(lastEnd)
  if (textAfter.trim()) segments.push(...parseConditionals(textAfter))

  return segments
}

// Parse text + conditionals (no links)
function parseConditionals(content: string): PassageSegment[] {
  const segments: PassageSegment[] = []
  const ifRegex =
    /\(if:\s*\$(\w+)\s+(is not|is)\s+"([^"]*)"\)\[([\s\S]*?)\](?:\(else:\)\[([\s\S]*?)\])?/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = ifRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index)
      if (text.trim()) segments.push({ type: 'text', content: text })
    }

    segments.push({
      type: 'conditional',
      variable: match[1],
      condition: match[2] === 'is not' ? 'not-empty' : 'empty',
      ifContent: match[4],
      elseContent: match[5],
    })

    lastIndex = ifRegex.lastIndex
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex)
    if (text.trim()) segments.push({ type: 'text', content: text })
  }

  return segments
}
