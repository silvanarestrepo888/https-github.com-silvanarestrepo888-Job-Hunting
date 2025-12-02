import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { callCiro } from '@/lib/ciro'
import { generateHierarchyAndEmail } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json()
    
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    try {
      // Step 1: Enrich with Ciro API
      const enrichment = await callCiro({
        name: lead.name,
        company: lead.company || '',
        linkedinUrl: lead.linkedinUrl
      })

      // Step 2: Generate hierarchy and email with Claude
      const augmentation = await generateHierarchyAndEmail({
        name: lead.name,
        title: lead.title || '',
        company: lead.company || '',
        connectionDegree: lead.connectionDegree,
        email: enrichment.email,
        phone: enrichment.phone
      })

      // Step 3: Update lead with enriched data
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          email: enrichment.email,
          phone: enrichment.phone,
          hierarchy: augmentation.hierarchy,
          emailTemplate: augmentation.emailTemplate,
          enrichmentStatus: 'completed',
          enrichedAt: new Date()
        }
      })

      return NextResponse.json({ 
        success: true,
        lead: updatedLead 
      })
    } catch (enrichError) {
      // Update lead with failed status
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          enrichmentStatus: 'failed'
        }
      })
      
      throw enrichError
    }

  } catch (error) {
    console.error('Enrich lead error:', error)
    return NextResponse.json({ error: 'Failed to enrich lead' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    
    if (!leadId) {
      // Enrich all leads that haven't been enriched yet
      const unenrichedLeads = await prisma.lead.findMany({
        where: {
          enrichmentStatus: 'pending'
        },
        take: 10 // Process in batches to avoid timeout
      })

      const results = []
      
      for (const lead of unenrichedLeads) {
        try {
          // Step 1: Enrich with Ciro API
          const enrichment = await callCiro({
            name: lead.name,
            company: lead.company || '',
            linkedinUrl: lead.linkedinUrl
          })

          // Step 2: Generate hierarchy and email with Claude
          const augmentation = await generateHierarchyAndEmail({
            name: lead.name,
            title: lead.title || '',
            company: lead.company || '',
            connectionDegree: lead.connectionDegree,
            email: enrichment.email,
            phone: enrichment.phone
          })

          // Step 3: Update lead with enriched data
          const updatedLead = await prisma.lead.update({
            where: { id: lead.id },
            data: {
              email: enrichment.email,
              phone: enrichment.phone,
              hierarchy: augmentation.hierarchy,
              emailTemplate: augmentation.emailTemplate,
              enrichmentStatus: 'completed',
              enrichedAt: new Date()
            }
          })

          results.push(updatedLead)
        } catch (error) {
          console.error(`Failed to enrich lead ${lead.id}:`, error)
        }
      }

      return NextResponse.json({ 
        success: true,
        count: results.length,
        leads: results 
      })
    }

    // Get specific lead enrichment status
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    return NextResponse.json({ 
      success: true,
      lead 
    })
  } catch (error) {
    console.error('Get enrichment status error:', error)
    return NextResponse.json({ error: 'Failed to get enrichment status' }, { status: 500 })
  }
}