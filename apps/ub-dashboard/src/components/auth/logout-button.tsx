"use client";

import { signOut } from "next-auth/react";

import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';

export function LogoutButton({ auth }: { auth?: ClientSafeProvider }) {
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

export function LogoutLink({ auth }: { auth?: ClientSafeProvider }) {
  return (
    <Button
      variant="ghost"
      className='p-0 my-0'
      onClick={() => signOut()}
    >
      Logout
    </Button>
  );
}