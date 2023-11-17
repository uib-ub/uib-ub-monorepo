"use client";

import { Button } from '@/components/ui/button';
import { signIn } from "next-auth/react";

const SignInButton = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn("dataporten")}
    >
      Logg inn
    </Button>
  );
};

export default SignInButton;

