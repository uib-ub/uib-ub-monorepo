import API from "@searchkit/api";
import { NextResponse } from 'next/server';
import config from 'lib/search/config'

export const runtime = 'edge';

const apiClient = API(config, { debug: false });

export async function POST(request: Request) {
  const results = await apiClient.handleRequest(await request.json());
  return NextResponse.json(results)
}
