"use client";

import React from 'react'
import { SessionProvider as AuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children as any}</AuthSessionProvider>
}



