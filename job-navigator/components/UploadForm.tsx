'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadFormProps {
  onUploadSuccess: () => void
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/uploadCSV', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        // Show detailed success message with enrichment status
        if (data.enrichedCount > 0 && data.failedCount > 0) {
          toast.success(`Processed ${data.totalCount} leads: ${data.enrichedCount} enriched, ${data.failedCount} failed`)
        } else if (data.enrichedCount > 0) {
          toast.success(`Successfully enriched all ${data.enrichedCount} leads!`)
        } else if (data.totalCount > 0) {
          toast.error(`Upload successful but enrichment failed for all ${data.totalCount} leads`)
        } else {
          toast.success(`Successfully uploaded ${data.totalCount || data.count} leads`)
        }
        onUploadSuccess()
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-12 h-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV file with LinkedIn leads</p>
            {uploading && (
              <p className="mt-4 text-sm text-blue-500">Uploading...</p>
            )}
          </div>
        </label>
      </form>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">Expected CSV columns:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Name</strong> - Full name of the lead</li>
          <li><strong>Title</strong> - Job title/position (optional)</li>
          <li><strong>Company</strong> - Organization name (optional)</li>
          <li><strong>Location</strong> - City or region (optional)</li>
          <li><strong>LinkedIn URL</strong> - Profile URL (optional)</li>
          <li><strong>Connection Degree</strong> - 1st, 2nd, or 3rd (optional)</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Note: Leads will be automatically enriched with email/phone and AI-generated outreach during upload.
        </p>
      </div>
    </div>
  )
}