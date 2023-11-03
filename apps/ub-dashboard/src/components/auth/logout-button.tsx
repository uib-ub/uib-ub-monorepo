"use client";

import { signOut } from "next-auth/react";

import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';

export default function LogoutButton({ auth }: { auth?: ClientSafeProvider }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut()}
    >
      Logout
    </Button>
  );
}