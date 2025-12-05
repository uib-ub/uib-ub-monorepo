import { NextResponse } from 'next/server'
import { prisma } from '../../../db/client'

export async function GET() {
  try {
    const links = await prisma.link.findMany()
    return NextResponse.json(links)
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}

