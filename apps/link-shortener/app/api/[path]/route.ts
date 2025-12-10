import { NextRequest, NextResponse } from 'next/server'
import { LinksRecord, XataClient } from '../../../utils/xata';

const xata = new XataClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params
    const response: LinksRecord | null = await xata.db.links.filter("path", path).getFirst()

    if (!response) {
      return NextResponse.json(
        {
          error: { message: `No redirect found` },
        },
        { status: 404 }
      )
    }

    const { id, redirectType, originalURL, views } = response
    await xata.db.links.update(id, { views: views + 1 })

    return NextResponse.redirect(originalURL, { status: redirectType })
  } catch (err) {
    return NextResponse.json(
      {
        error: { message: `An error ocurred, ${err}` },
      },
      { status: 500 }
    )
  }
}
