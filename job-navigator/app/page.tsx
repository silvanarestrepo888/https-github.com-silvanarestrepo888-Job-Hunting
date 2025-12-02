'use client'

import { useState } from 'react'
import { Briefcase, Upload, Users } from 'lucide-react'
import UploadForm from '@/components/UploadForm'
import Link from 'next/link'

export default function Home() {
  const [uploaded, setUploaded] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-12 pb-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Briefcase className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Job Navigator
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered lead enrichment and personalized outreach platform
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload LinkedIn Leads
            </h2>
            <UploadForm onUploadSuccess={() => setUploaded(true)} />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              How It Works
            </h2>
            <ol className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Upload CSV</p>
                  <p>Import your LinkedIn leads from a CSV file</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Enrich Data</p>
                  <p>Automatically find emails, phone numbers, and company info</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">AI Analysis</p>
                  <p>Infer organizational hierarchy and relationships</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  4
                </span>
                <div>
                  <p className="font-medium text-gray-900">Generate Outreach</p>
                  <p>Create personalized emails for each lead</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  5
                </span>
                <div>
                  <p className="font-medium text-gray-900">Track & Manage</p>
                  <p>Monitor outreach status and add notes</p>
                </div>
              </li>
            </ol>

            {uploaded && (
              <Link
                href="/dashboard"
                className="mt-6 w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Dashboard →
              </Link>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-4">
            Upload your LinkedIn leads CSV file to begin enrichment and outreach
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
