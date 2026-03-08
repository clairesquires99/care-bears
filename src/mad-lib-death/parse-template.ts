export type TextSegment = { type: 'text'; content: string }
export type ChoiceSegment = { type: 'choice'; options: string[] }
export type InputSegment = { type: 'input' }
export type Segment = TextSegment | ChoiceSegment | InputSegment

export function parseTemplate(template: string): Segment[] {
  const segments: Segment[] = []
  const regex = /\{([^}]+)\}/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: template.slice(lastIndex, match.index) })
    }
    const inner = match[1]
    if (inner === '___') {
      segments.push({ type: 'input' })
    } else {
      segments.push({ type: 'choice', options: inner.split('|') })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < template.length) {
    segments.push({ type: 'text', content: template.slice(lastIndex) })
  }

  return segments
}
