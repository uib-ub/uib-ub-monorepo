"use client";

import { signOut } from "next-auth/react";

import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';

export function LogoutButton({ auth }: { readonly auth?: ClientSafeProvider }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut()}
    >
      Logout
    </Button>
  );
}
