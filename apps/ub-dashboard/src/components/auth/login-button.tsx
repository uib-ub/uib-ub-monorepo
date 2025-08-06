import React from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from '@/auth'

export function SignIn({
  size = 'sm', variant = 'outline', className
}: {
  size?: 'sm' | 'lg', variant?: 'outline' | 'default' | 'link' | 'destructive' | 'secondary' | 'ghost', className?: string
}) {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('dataporten')
      }}
    >
      <Button
        type='submit'
        variant={variant}
        size={size}
        className={className}
      >
        Logg inn
      </Button>
    </form>
  )
} 