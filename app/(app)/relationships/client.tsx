'use client'

import { useState } from 'react'
import { Relationship } from '@/src/lib/types'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { addRelationship, deleteRelationship } from './actions'

const QUICK_NAMES = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Partner']

export function RelationshipsClient({ initial }: { initial: Relationship[] }) {
  const [showForm, setShowForm] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName) return
    setSaving(true)
    setError('')
    const result = await addRelationship(displayName, email)
    if (result.error) { setError(result.error); setSaving(false); return }
    setDisplayName('')
    setEmail('')
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deleteRelationship(id)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1512' }}>Relationships</h1>
          <p className="text-sm mt-1" style={{ color: '#6b5e52' }}>People you can send conversations to</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Add person
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 shadow-sm">
          <h2 className="font-semibold mb-4" style={{ color: '#1a1512' }}>Add a person</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {QUICK_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setDisplayName(name)}
                  className="px-3 py-1.5 rounded-full text-sm border transition-all"
                  style={{
                    background: displayName === name ? '#fde8c8' : 'transparent',
                    borderColor: displayName === name ? '#f59e0b' : '#e5ddd5',
                    color: displayName === name ? '#92400e' : '#6b5e52',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Name (e.g. Mom, Dad)"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#e5ddd5', background: '#f6f3ef' }}
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#e5ddd5', background: '#f6f3ef' }}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !displayName} size="sm">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {initial.length === 0 ? (
        <Card muted className="p-8 text-center">
          <p className="text-sm mb-4" style={{ color: '#9a8a7d' }}>No relationships yet.</p>
          <Button onClick={() => setShowForm(true)} size="sm">Add your first person</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {initial.map((rel) => (
            <Card key={rel.id} className="p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-semibold" style={{ color: '#1a1512' }}>{rel.display_name}</p>
                {rel.email && <p className="text-sm mt-0.5" style={{ color: '#9a8a7d' }}>{rel.email}</p>}
              </div>
              <button
                onClick={() => handleDelete(rel.id)}
                className="text-xs underline"
                style={{ color: '#c4a592' }}
              >
                Remove
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
