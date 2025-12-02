'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

interface NotePanelProps {
  leadId: string
}

export default function NotePanel({ leadId }: NotePanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)

  useEffect(() => {
    if (leadId) {
      fetchNotes()
    }
  }, [leadId])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?leadId=${leadId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, content: newNote })
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([data.note, ...notes])
        setNewNote('')
        setShowNewNote(false)
        toast.success('Note added successfully')
      } else {
        toast.error('Failed to add note')
      }
    } catch (error) {
      console.error('Add note error:', error)
      toast.error('Failed to add note')
    } finally {
      setLoading(false)
    }
  }

  const updateNote = async (noteId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content: editContent })
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(notes.map(n => n.id === noteId ? data.note : n))
        setEditingNote(null)
        setEditContent('')
        toast.success('Note updated successfully')
      } else {
        toast.error('Failed to update note')
      }
    } catch (error) {
      console.error('Update note error:', error)
      toast.error('Failed to update note')
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes?noteId=${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
        toast.success('Note deleted successfully')
      } else {
        toast.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Delete note error:', error)
      toast.error('Failed to delete note')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Notes ({notes.length})
        </h3>
        <button
          onClick={() => setShowNewNote(!showNewNote)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {showNewNote && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setShowNewNote(false)
                setNewNote('')
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={addNote}
              disabled={loading || !newNote.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notes yet. Add your first note above.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              {editingNote === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingNote(null)
                        setEditContent('')
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateNote(note.id)}
                      disabled={loading}
                      className="p-1.5 text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(note.createdAt)}
                      {note.updatedAt !== note.createdAt && ' (edited)'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingNote(note.id)
                          setEditContent(note.content)
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}