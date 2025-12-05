import { NextResponse } from 'next/server'
import { prisma } from '../../../../db/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params

  try {
    const link = await prisma.link.findFirst({
      // This 'where' clause looks for a Link where the 'path' matches the provided path OR the 'id' matches the provided path.
      // This allows the API to fetch a link by its short URL path *or* by its database ID, whichever is supplied in ':path'.
      where: {
        OR: [
          { path },
          { id: path }
        ]
      },
    })

    if (!link || !link.originalURL) {
      return NextResponse.json(
        { error: { message: 'No redirect found' } },
        { status: 404 }
      )
    }

    return NextResponse.json(link)
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}

