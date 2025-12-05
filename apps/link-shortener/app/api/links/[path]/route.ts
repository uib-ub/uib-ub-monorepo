import { NextResponse } from 'next/server'
import { getXataClient, type LinksRecord } from '../../../../utils/xata'

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

    return NextResponse.json(response)
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}

