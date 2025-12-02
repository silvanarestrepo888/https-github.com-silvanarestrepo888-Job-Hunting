'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Building, Briefcase, ChevronRight, RefreshCw, Users, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  name: string
  title?: string
  company?: string
  location?: string
  linkedinUrl?: string
  connectionDegree?: string
  email?: string
  phone?: string
  hierarchy?: string
  emailTemplate?: string
  enrichmentStatus?: string
  enrichedAt?: string
  createdAt: string
}

interface LeadTableProps {
  onSelectLead: (lead: Lead) => void
  refreshTrigger?: number
}

export default function LeadTable({ onSelectLead, refreshTrigger }: LeadTableProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [enriching, setEnriching] = useState<string | null>(null)
  const [connectionFilter, setConnectionFilter] = useState<string>('all')
  const [showStats, setShowStats] = useState(true)
  const [sortBy, setSortBy] = useState<'default' | 'connection' | 'name' | 'company'>('connection')

  useEffect(() => {
    fetchLeads()
  }, [refreshTrigger])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  // Filter leads by connection degree
  const filteredLeads = leads.filter(lead => {
    if (connectionFilter === 'all') return true
    if (connectionFilter === 'none') return !lead.connectionDegree
    return lead.connectionDegree === connectionFilter
  })

  // Sort leads based on selected criteria
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'connection') {
      // Priority: 1st > 2nd > 3rd > none
      const connectionOrder: { [key: string]: number } = {
        '1st': 1,
        '2nd': 2,
        '3rd': 3
      }
      const aOrder = connectionOrder[a.connectionDegree || ''] || 4
      const bOrder = connectionOrder[b.connectionDegree || ''] || 4
      return aOrder - bOrder
    } else if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '')
    } else if (sortBy === 'company') {
      return (a.company || '').localeCompare(b.company || '')
    }
    return 0 // default order
  })

  // Calculate connection statistics
  const connectionStats = {
    '1st': leads.filter(l => l.connectionDegree === '1st').length,
    '2nd': leads.filter(l => l.connectionDegree === '2nd').length,
    '3rd': leads.filter(l => l.connectionDegree === '3rd').length,
    'none': leads.filter(l => !l.connectionDegree).length,
    'total': leads.length
  }

  const handleEnrich = async (leadId: string) => {
    setEnriching(leadId)
    try {
      const response = await fetch('/api/enrichLead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      })

      if (response.ok) {
        const data = await response.json()
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? data.lead : lead
        ))
        toast.success('Lead enriched successfully')
      } else {
        toast.error('Failed to enrich lead')
      }
    } catch (error) {
      console.error('Enrich error:', error)
      toast.error('Failed to enrich lead')
    } finally {
      setEnriching(null)
    }
  }

  const handleEnrichAll = async () => {
    const unenrichedLeads = leads.filter(lead => lead.enrichmentStatus === 'pending')
    if (unenrichedLeads.length === 0) {
      toast('All leads are already enriched')
      return
    }

    toast.loading(`Enriching ${unenrichedLeads.length} leads...`)
    
    try {
      const response = await fetch('/api/enrichLead')
      if (response.ok) {
        await fetchLeads()
        toast.dismiss()
        toast.success('Enrichment process completed')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Enrichment failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No leads uploaded yet. Upload a CSV to get started.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Connection Statistics */}
      {showStats && leads.length > 0 && (
        <div className="mb-4 grid grid-cols-5 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">1st Degree</p>
                <p className="text-2xl font-bold text-green-700">{connectionStats['1st']}</p>
              </div>
              <Users className="w-8 h-8 text-green-300" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">2nd Degree</p>
                <p className="text-2xl font-bold text-yellow-700">{connectionStats['2nd']}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">3rd Degree</p>
                <p className="text-2xl font-bold text-gray-700">{connectionStats['3rd']}</p>
              </div>
              <Users className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">Unknown</p>
                <p className="text-2xl font-bold text-red-700">{connectionStats['none']}</p>
              </div>
              <Users className="w-8 h-8 text-red-300" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-blue-700">{connectionStats['total']}</p>
              </div>
              <Users className="w-8 h-8 text-blue-300" />
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Leads ({filteredLeads.length})</h2>
          
          {/* Connection Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={connectionFilter}
              onChange={(e) => setConnectionFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Connections</option>
              <option value="1st">1st Degree Only</option>
              <option value="2nd">2nd Degree Only</option>
              <option value="3rd">3rd Degree Only</option>
              <option value="none">No Connection</option>
            </select>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="connection">Connection Priority</option>
              <option value="name">Name</option>
              <option value="company">Company</option>
              <option value="default">Default</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          <button
            onClick={handleEnrichAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Enrich All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connection
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    {lead.location && (
                      <div className="text-xs text-gray-500">{lead.location}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.title || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-900">{lead.company || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {lead.email ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        {lead.email}
                      </div>
                    ) : null}
                    {lead.phone ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {lead.phone}
                      </div>
                    ) : null}
                    {!lead.email && !lead.phone && (
                      <span className="text-sm text-gray-400">Not enriched</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.connectionDegree ? (
                    <span className={`inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full px-3 py-1 ${
                      lead.connectionDegree === '1st' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : lead.connectionDegree === '2nd'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : lead.connectionDegree === '3rd'
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        lead.connectionDegree === '1st' 
                          ? 'bg-green-500'
                          : lead.connectionDegree === '2nd'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`} />
                      {lead.connectionDegree}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unknown</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {lead.enrichmentStatus === 'completed' && (
                      <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 px-2">
                        Enriched
                      </span>
                    )}
                    {lead.enrichmentStatus === 'pending' && (
                      <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 px-2">
                        Pending
                      </span>
                    )}
                    {lead.enrichmentStatus === 'failed' && (
                      <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 px-2">
                        Failed
                      </span>
                    )}
                    {lead.emailTemplate && (
                      <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 px-2">
                        Email Ready
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {lead.enrichmentStatus === 'pending' && (
                      <button
                        onClick={() => handleEnrich(lead.id)}
                        disabled={enriching === lead.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {enriching === lead.id ? 'Enriching...' : 'Enrich'}
                      </button>
                    )}
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      View
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}