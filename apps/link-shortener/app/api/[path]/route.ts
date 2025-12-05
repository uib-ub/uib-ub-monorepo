import { NextResponse } from 'next/server'
import { LinksRecord, getXataClient } from '../../../utils/xata'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params
  const xata = getXataClient()

  try {
    const response: LinksRecord | null = await xata.db.links
      .filter('path', path)
      .getFirst()

    if (!response) {
      return NextResponse.json(
        { error: { message: 'No redirect found' } },
        { status: 404 }
      )
    }

    const { id, redirectType, originalURL, views } = response
    await xata.db.links.update(id, { views: views + 1 })

    return NextResponse.redirect(originalURL, { status: redirectType })
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}

