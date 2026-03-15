'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Relationship } from '@/src/lib/types'
import { Button } from '@/src/components/ui/Button'

interface RelationshipPickerProps {
  onConfirm: (relationships: Relationship[]) => void
  onClose: () => void
}

export function RelationshipPicker({ onConfirm, onClose }: RelationshipPickerProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('relationships').select('*').order('created_at').then(({ data }) => {
      setRelationships(data ?? [])
      setLoading(false)
    })
  }, [])

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
    onConfirm(chosen)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6 shadow-xl" style={{ background: '#ffffff' }}>
        <h2 className="font-bold text-lg mb-1" style={{ color: '#1a1512' }}>Send to...</h2>
        <p className="text-sm mb-5" style={{ color: '#6b5e52' }}>Choose who to send this conversation to</p>

        {loading ? (
          <p className="text-sm" style={{ color: '#9a8a7d' }}>Loading...</p>
        ) : relationships.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm mb-3" style={{ color: '#9a8a7d' }}>No relationships yet.</p>
            <a href="/relationships" className="text-sm underline" style={{ color: '#d97706' }}>
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
                    background: isSelected ? '#fef8f0' : '#f6f3ef',
                    borderColor: isSelected ? '#f59e0b' : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: '#fbd08f', color: '#92400e' }}
                  >
                    {rel.display_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#1a1512' }}>{rel.display_name}</p>
                    {rel.email && <p className="text-xs" style={{ color: '#9a8a7d' }}>{rel.email}</p>}
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-sm" style={{ color: '#d97706' }}>✓</span>
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
