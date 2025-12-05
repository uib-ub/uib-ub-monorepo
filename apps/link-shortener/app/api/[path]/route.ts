import { NextResponse } from 'next/server'
import { prisma } from '../../../db/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params

  try {
    const link = await prisma.link.findFirst({
      where: {
        path
      },
    })

    if (!link || !link.originalURL) {
      return NextResponse.json(
        { error: { message: 'No redirect found' } },
        { status: 404 }
      )
    }

    // Update views count atomically to avoid race conditions
    await prisma.link.update({
      where: { id: link.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.redirect(link.originalURL, { status: link.redirectType })
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}

