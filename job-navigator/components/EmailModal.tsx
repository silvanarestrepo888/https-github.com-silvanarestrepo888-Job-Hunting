'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Send, RefreshCw, Edit2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmailModalProps {
  lead: {
    id: string
    name: string
    email?: string
    emailTemplate?: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function EmailModal({ lead, isOpen, onClose }: EmailModalProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (lead.emailTemplate) {
      // Parse subject and content from template
      const lines = lead.emailTemplate.split('\n')
      if (lines[0].startsWith('Subject: ')) {
        setSubject(lines[0].replace('Subject: ', ''))
        setContent(lines.slice(2).join('\n'))
      } else {
        setContent(lead.emailTemplate)
      }
    }
  }, [lead])

  const generateEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: lead.id,
          regenerate: true 
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.emailTemplate) {
          // Parse subject and content from template
          const lines = data.emailTemplate.split('\n')
          if (lines[0].startsWith('Subject: ')) {
            setSubject(lines[0].replace('Subject: ', ''))
            setContent(lines.slice(2).join('\n'))
          } else {
            setContent(data.emailTemplate)
          }
        } else if (data.email) {
          setSubject(data.email.subject)
          setContent(data.email.content)
        }
        toast.success('Email generated successfully')
      } else {
        toast.error('Failed to generate email')
      }
    } catch (error) {
      console.error('Generate email error:', error)
      toast.error('Failed to generate email')
    } finally {
      setLoading(false)
    }
  }

  const saveEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: lead.id,
          subject,
          content
        })
      })

      if (response.ok) {
        toast.success('Email saved successfully')
        setIsEditing(false)
      } else {
        toast.error('Failed to save email')
      }
    } catch (error) {
      console.error('Save email error:', error)
      toast.error('Failed to save email')
    } finally {
      setLoading(false)
    }
  }

  const markAsSent = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id })
      })

      if (response.ok) {
        toast.success('Email marked as sent')
        onClose()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Mark as sent error:', error)
      toast.error('Failed to update status')
    } finally {
      setSending(false)
    }
  }

  const copyToClipboard = () => {
    const emailText = `Subject: ${subject}\n\n${content}`
    navigator.clipboard.writeText(emailText)
    toast.success('Email copied to clipboard')
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-3xl max-h-[85vh] bg-white rounded-lg shadow-lg p-6 overflow-hidden data-[state=open]:animate-contentShow">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              Email for {lead.name}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {!lead.email ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  This lead hasn't been enriched yet. Please enrich the lead first to get their email address.
                </p>
              </div>
            ) : null}

            {lead.email && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To:
                  </label>
                  <input
                    type="email"
                    value={lead.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                    placeholder="Email subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content:
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    readOnly={!isEditing}
                    rows={12}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                    placeholder="Email content..."
                  />
                </div>
              </>
            )}
          </div>

          {lead.email && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="flex gap-2">
                {!content && (
                  <button
                    onClick={generateEmail}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Generate Email
                  </button>
                )}
                {content && (
                  <>
                    <button
                      onClick={generateEmail}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={saveEmail}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                    )}
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Copy to Clipboard
                    </button>
                  </>
                )}
              </div>

            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}