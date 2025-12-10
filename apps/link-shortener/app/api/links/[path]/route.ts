import { NextRequest, NextResponse } from 'next/server'
import { XataClient, type LinksRecord } from '../../../../utils/xata';

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

    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        error: { message: `An error ocurred, ${err}` },
      },
      { status: 500 }
    )
  }
}
