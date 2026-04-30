'use client'

import { track } from '@vercel/analytics'
import { useState } from 'react'
import { Relationship } from '@/src/lib/types'
import { Button } from '@/src/components/ui/Button'

interface RelationshipPickerProps {
  onConfirm: (relationships: Relationship[]) => void
  onClose: () => void
  storyId?: string
  storyTitle?: string
  relationships: Relationship[]
}

export function RelationshipPicker({ onConfirm, onClose, storyId, storyTitle, relationships }: RelationshipPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const chosen = relationships.filter((r) => selected.has(r.id))
    track("story_send_to_clicked", {
      ...(storyId && { story_id: storyId }),
      ...(storyTitle && { story_title: storyTitle }),
    })
    onConfirm(chosen)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6 shadow-xl" style={{ background: '#ffffff' }}>
        <h2 className="font-bold text-lg mb-1" style={{ color: '#2a1806' }}>Send to...</h2>
        <p className="text-sm mb-5" style={{ color: '#9a7040' }}>Choose who to send this conversation to</p>

        {relationships.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm mb-3" style={{ color: '#9a7040' }}>No relationships yet.</p>
            <a href="/relationships" className="text-sm underline" style={{ color: '#d8701a' }}>
              Add someone first
            </a>
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            {relationships.map((rel) => {
              const isSelected = selected.has(rel.id)
              return (
                <button
                  key={rel.id}
                  onClick={() => toggle(rel.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all"
                  style={{
                    background: isSelected ? 'rgba(216,112,26,0.05)' : '#f6eedb',
                    borderColor: isSelected ? '#f08838' : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: '#fbd08f', color: '#5a4030' }}
                  >
                    {rel.display_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#2a1806' }}>{rel.display_name}</p>
                    {rel.email && <p className="text-xs" style={{ color: '#9a7040' }}>{rel.email}</p>}
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-sm" style={{ color: '#d8701a' }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="flex-1"
            size="sm"
          >
            Send conversation
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
