"use client";

import { signOut } from "next-auth/react";

import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';

export function LogoutButton({ className, auth }: { className?: string, readonly auth?: ClientSafeProvider }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => signOut()}
    >
      Logout
    </Button>
  );
}
