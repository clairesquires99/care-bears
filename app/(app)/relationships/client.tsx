'use client'

import { useState } from 'react'
import { Relationship } from '@/src/lib/types'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { addRelationship, deleteRelationship, deleteRelationshipAndConversations } from './actions'

const QUICK_NAMES = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Partner']

export function RelationshipsClient({ initial }: { initial: Relationship[] }) {
  const [relationships, setRelationships] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmCascadeDeleteId, setConfirmCascadeDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName) return
    setSaving(true)
    setAddError('')
    const result = await addRelationship(displayName, email)
    if (result.error) { setAddError(result.error); setSaving(false); return }
    setRelationships((prev) => [...prev, result.data])
    setDisplayName('')
    setEmail('')
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    setDeleteError('')
    const result = await deleteRelationship(id)
    setDeleting(false)
    if (result.error === 'HAS_CONVERSATIONS') {
      setConfirmDeleteId(null)
      setConfirmCascadeDeleteId(id)
      return
    }
    if (result.error) { setDeleteError(result.error); return }
    setRelationships((prev) => prev.filter((r) => r.id !== id))
    setConfirmDeleteId(null)
  }

  async function handleCascadeDelete(id: string) {
    setDeleting(true)
    setDeleteError('')
    const result = await deleteRelationshipAndConversations(id)
    setDeleting(false)
    if (result.error) { setDeleteError(result.error); return }
    setRelationships((prev) => prev.filter((r) => r.id !== id))
    setConfirmCascadeDeleteId(null)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2a1806' }}>Relationships</h1>
          <p className="text-sm mt-1" style={{ color: '#9a7040' }}>People you can send conversations to</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Add person
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 shadow-sm">
          <h2 className="font-semibold mb-4" style={{ color: '#2a1806' }}>Add a person</h2>
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
                    borderColor: displayName === name ? '#f08838' : 'rgba(60,30,10,0.12)',
                    color: displayName === name ? '#5a4030' : '#9a7040',
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
              style={{ borderColor: 'rgba(60,30,10,0.12)', background: '#f6eedb' }}
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'rgba(60,30,10,0.12)', background: '#f6eedb' }}
            />
            {addError && <p className="text-sm text-red-600">{addError}</p>}
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

      {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}

      {relationships.length === 0 ? (
        <Card muted className="p-8 text-center">
          <p className="text-sm mb-4" style={{ color: '#9a7040' }}>No relationships yet.</p>
          <Button onClick={() => setShowForm(true)} size="sm">Add your first person</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {relationships.map((rel) => (
            <Card key={rel.id} className="p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-semibold" style={{ color: '#2a1806' }}>{rel.display_name}</p>
                {rel.email && <p className="text-sm mt-0.5" style={{ color: '#9a7040' }}>{rel.email}</p>}
              </div>
              {confirmCascadeDeleteId === rel.id ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs text-right" style={{ color: '#9a7040' }}>
                    This will also delete their conversations.
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCascadeDelete(rel.id)}
                      disabled={deleting}
                      className="text-xs underline disabled:opacity-50"
                      style={{ color: '#c0392b' }}
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete everything'}
                    </button>
                    <button
                      onClick={() => setConfirmCascadeDeleteId(null)}
                      className="text-xs underline"
                      style={{ color: '#9a7040' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : confirmDeleteId === rel.id ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: '#9a7040' }}>Remove {rel.display_name}?</span>
                  <button
                    onClick={() => handleDelete(rel.id)}
                    disabled={deleting}
                    className="text-xs underline disabled:opacity-50"
                    style={{ color: '#c0392b' }}
                  >
                    {deleting ? 'Removing...' : 'Yes, remove'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs underline"
                    style={{ color: '#9a7040' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setDeleteError(''); setConfirmDeleteId(rel.id) }}
                  className="text-xs underline"
                  style={{ color: '#c4a592' }}
                >
                  Remove
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
