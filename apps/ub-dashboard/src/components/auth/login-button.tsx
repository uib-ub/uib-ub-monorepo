import React from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from "@/auth"

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("dataporten")
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
      >
        Logg inn
      </Button>
    </form>
  )
}