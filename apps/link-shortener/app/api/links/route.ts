import { NextRequest, NextResponse } from 'next/server'
import { XataClient } from '../../../utils/xata';

const xata = new XataClient()

const getLinks = async () => {
  return await xata.db.links.getAll();
}

export async function GET(request: NextRequest) {
  const links = await getLinks()
  return NextResponse.json(links, { status: 200 })
}
