import { handlers } from "@/auth"

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>
}

export async function GET(request: Request, context: AuthRouteContext) {
  void context
  return handlers.GET(request as unknown as Parameters<typeof handlers.GET>[0])
}

export async function POST(request: Request, context: AuthRouteContext) {
  void context
  return handlers.POST(request as unknown as Parameters<typeof handlers.POST>[0])
}

