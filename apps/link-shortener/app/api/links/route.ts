import { NextResponse } from 'next/server'
import { getXataClient } from '../../../utils/xata'

export async function GET() {
  const xata = getXataClient()
  const links = await xata.db.links.getAll()
  return NextResponse.json(links)
}

