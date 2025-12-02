'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Home, Mail, Map, FileText } from 'lucide-react'
import Link from 'next/link'
import LeadTable from '@/components/LeadTable'
import MapView from '@/components/MapView'
import EmailModal from '@/components/EmailModal'
import NotePanel from '@/components/NotePanel'

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [companyLeads, setCompanyLeads] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'table' | 'map' | 'notes'>('table')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (selectedLead?.company) {
      fetchCompanyLeads(selectedLead.company)
    }
  }, [selectedLead])

  const fetchCompanyLeads = async (company: string) => {
    try {
      const response = await fetch(`/api/leads?company=${encodeURIComponent(company)}`)
      if (response.ok) {
        const data = await response.json()
        setCompanyLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Failed to fetch company leads:', error)
    }
  }

  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead)
    setActiveTab('map')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-semibold">Lead Dashboard</h1>
            </div>
            {selectedLead && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Selected: <strong>{selectedLead.name}</strong>
                </span>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  Generate Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedLead && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedLead.name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600">
                    {selectedLead.title} at {selectedLead.company}
                  </p>
                  {selectedLead.connectionDegree && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
                      selectedLead.connectionDegree === '1st' 
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : selectedLead.connectionDegree === '2nd'
                        ? 'bg-yellow-100 text-yellow-600 border border-yellow-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {selectedLead.connectionDegree}
                    </span>
                  )}
                </div>
                {selectedLead.email && (
                  <p className="text-sm text-gray-500 mt-1">{selectedLead.email}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-4 py-2 text-sm rounded-md ${
                    activeTab === 'table'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Table
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2 text-sm rounded-md ${
                    activeTab === 'map'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Map className="w-4 h-4 inline mr-2" />
                  Hierarchy
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 text-sm rounded-md ${
                    activeTab === 'notes'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notes
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'table' && (
            <LeadTable 
              onSelectLead={handleSelectLead} 
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'map' && selectedLead && (
            <MapView 
              lead={selectedLead} 
              companyLeads={companyLeads}
            />
          )}
          
          {activeTab === 'notes' && selectedLead && (
            <NotePanel leadId={selectedLead.id} />
          )}
        </div>
      </div>

      {selectedLead && (
        <EmailModal
          lead={selectedLead}
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false)
            setRefreshTrigger(prev => prev + 1)
          }}
        />
      )}
    </div>
  )
}