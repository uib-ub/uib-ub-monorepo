'use server'

import { cookies } from 'next/headers'

export async function validatePassword(formData: FormData) {
  const password = formData.get('password') as string
  
  if (password === process.env.HISTORIEDAGAR_2025) {
    const cookieStore = await cookies()
    cookieStore.set('presentationAccess', 'historiedagar2025', {
      maxAge: 60 * 60 * 24 // 24 hours
    })
    return { success: true }
  }
  return { success: false }
}

export async function verifyAccess(presentationId: string) {
  const cookieStore = await cookies()
  return cookieStore.get('presentationAccess')?.value === presentationId
}

