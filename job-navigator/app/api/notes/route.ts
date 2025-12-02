import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const notes = await prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      notes 
    })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'Failed to get notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leadId, content } = await request.json()
    
    if (!leadId || !content) {
      return NextResponse.json({ error: 'Lead ID and content required' }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        leadId,
        content
      }
    })

    return NextResponse.json({ 
      success: true,
      note 
    })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { noteId, content } = await request.json()
    
    if (!noteId || !content) {
      return NextResponse.json({ error: 'Note ID and content required' }, { status: 400 })
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { content }
    })

    return NextResponse.json({ 
      success: true,
      note 
    })
  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')
    
    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    await prisma.note.delete({
      where: { id: noteId }
    })

    return NextResponse.json({ 
      success: true
    })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}