"use client";

import { forwardRef } from "react";
import { signOut } from "next-auth/react";
import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';

interface LogoutButtonProps {
  className?: string;
  readonly auth?: ClientSafeProvider;
}

export const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ className, auth }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={className}
        onClick={() => signOut()}
      >
        Logout
      </Button>
    );
  }
);

LogoutButton.displayName = 'LogoutButton';
