"use client";

import { signIn } from "next-auth/react";

import type { ClientSafeProvider } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { FC } from 'react';


interface LoginButtonProps {
  readonly auth?: ClientSafeProvider;
  className?: string;
}

const LoginButton: FC<LoginButtonProps> = ({ auth, className }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn(auth?.id ?? '')}
    >
      {auth ? `Sign In with ${auth.name}` : 'Login'}
    </Button>
  );
};

export default LoginButton;
