import Client from "@searchkit/api";
import { NextRequest, NextResponse } from "next/server";
import config from "lib/search/config";

const apiClient = Client(config, { debug: false });

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json()

  const results = await apiClient.handleRequest(data)
  return NextResponse.json(results)
}