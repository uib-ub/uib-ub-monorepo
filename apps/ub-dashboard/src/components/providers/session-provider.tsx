"use client";

import { SessionProvider as AuthSessiontProvider } from "next-auth/react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthSessiontProvider>{children}</AuthSessiontProvider>;
}



