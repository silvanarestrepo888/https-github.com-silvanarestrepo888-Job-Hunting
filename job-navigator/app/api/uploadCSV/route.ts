import { NextResponse } from 'next/server'
import { parse } from 'papaparse'
import { prisma } from '@/lib/db'
import { callCiro } from '@/lib/ciro'
import { callClaude, generateHierarchyAndEmail } from '@/lib/claude'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    
    const result = parse(text, {
      header: true,
      skipEmptyLines: true
    })

    if (result.errors.length > 0) {
      return NextResponse.json({ error: 'Failed to parse CSV', details: result.errors }, { status: 400 })
    }

    const leads = []
    const failedLeads = []

    for (const row of result.data as any[]) {
      // Parse CSV fields
      const name = row.Name || row.name || `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim() || 'Unknown'
      const title = row.Title || row.title || row.Position || row.position || null
      const company = row.Company || row.company || row.Organization || row.organization || null
      const location = row.Location || row.location || row.City || row.city || null
      const linkedinUrl = row['LinkedIn URL'] || row.linkedinUrl || row.LinkedIn || row.linkedin || null
      const connectionDegree = row['Connection Degree'] || row.connectionDegree || row.Connection || row.connection || null

      try {
        // Step 1: Enrichment via Ciro API
        const enrichment = await callCiro({ 
          name, 
          company: company || '', 
          linkedinUrl 
        })

        // Step 2: Generate hierarchy and email via Claude API
        const augmentation = await generateHierarchyAndEmail({
          name,
          title: title || '',
          company: company || '',
          connectionDegree,
          email: enrichment.email,
          phone: enrichment.phone
        })

        // Step 3: Store enriched lead
        const lead = await prisma.lead.create({
          data: {
            name,
            title,
            company,
            location,
            linkedinUrl,
            connectionDegree,
            email: enrichment.email,
            phone: enrichment.phone,
            hierarchy: augmentation.hierarchy,
            emailTemplate: augmentation.emailTemplate,
            enrichmentStatus: 'completed',
            enrichedAt: new Date()
          }
        })
        leads.push(lead)
        
      } catch (err) {
        console.error(`Failed to enrich ${name}:`, err)
        
        // Store lead with failed status
        const failedLead = await prisma.lead.create({
          data: {
            name,
            title,
            company,
            location,
            linkedinUrl,
            connectionDegree,
            enrichmentStatus: 'failed'
          }
        })
        failedLeads.push(failedLead)
      }
    }

    return NextResponse.json({ 
      message: 'CSV processed',
      success: true,
      enrichedCount: leads.length,
      failedCount: failedLeads.length,
      totalCount: leads.length + failedLeads.length,
      leads: leads,
      failedLeads: failedLeads
    })
  } catch (error) {
    console.error('Upload CSV error:', error)
    return NextResponse.json({ error: 'Failed to process CSV file' }, { status: 500 })
  }
}