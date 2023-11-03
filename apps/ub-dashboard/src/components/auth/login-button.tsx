"use client";

import { signIn } from "next-auth/react";

import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';

export default function LoginButton({ auth }: { auth?: ClientSafeProvider }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn(auth?.id ?? "")}
    >
      {auth ? `Sign In with ${auth.name}` : "Login"}
    </Button>
  );
}