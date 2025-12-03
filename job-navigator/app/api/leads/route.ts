import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')
    const enriched = searchParams.get('enriched')

    const where: any = {}
    
    if (company) {
      where.company = company
    }
    
    if (enriched === 'true') {
      where.email = { not: null }
    } else if (enriched === 'false') {
      where.email = null
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      leads 
    })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}