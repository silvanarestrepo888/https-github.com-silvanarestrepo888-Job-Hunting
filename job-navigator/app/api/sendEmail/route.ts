import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateEmail } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { leadId, regenerate = false, context = '' } = await request.json()
    
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if email template already exists and regenerate is false
    if (lead.emailTemplate && !regenerate) {
      return NextResponse.json({ 
        success: true,
        emailTemplate: lead.emailTemplate
      })
    }

    // Parse name for email generation
    const nameParts = lead.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Generate email with Claude
    const emailData = await generateEmail({
      firstName,
      lastName,
      title: lead.title || '',
      company: lead.company || '',
      companySize: undefined,
      industry: undefined
    }, context)

    // Combine subject and content into template
    const emailTemplate = `Subject: ${emailData.subject}\n\n${emailData.content}`
    
    // Update lead with generated email
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        emailTemplate
      }
    })

    return NextResponse.json({ 
      success: true,
      email: emailData,
      lead: updatedLead
    })
  } catch (error) {
    console.error('Generate email error:', error)
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { leadId, subject, content } = await request.json()
    
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    // Combine subject and content into template
    const emailTemplate = subject && content ? `Subject: ${subject}\n\n${content}` : content
    
    // Update email content
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        emailTemplate
      }
    })

    return NextResponse.json({ 
      success: true,
      lead: updatedLead
    })
  } catch (error) {
    console.error('Update email error:', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { leadId } = await request.json()
    
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    // This endpoint can be removed or repurposed since we don't have emailSent field anymore
    // For now, just return the lead
    const updatedLead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    return NextResponse.json({ 
      success: true,
      lead: updatedLead
    })
  } catch (error) {
    console.error('Mark email sent error:', error)
    return NextResponse.json({ error: 'Failed to mark email as sent' }, { status: 500 })
  }
}