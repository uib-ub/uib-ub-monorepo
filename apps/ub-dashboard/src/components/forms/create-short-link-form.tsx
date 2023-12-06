'use client'

import { useRef } from 'react'
// @ts-ignore
import { useFormState } from 'react-dom'
// @ts-ignore
import { useFormStatus } from 'react-dom'
import { createShortLink } from '@/actions/link-action'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form } from '../ui/form'

const initialState = {
  message: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      className={`w-full ${pending ? 'cursor-not-allowed opacity-50' : ''
        }`}
    >
      Legg til
    </Button>
  )
}

export function CreateShortLinkForm() {
  const [state, formAction] = useFormState(createShortLink, initialState)
  const ref = useRef<HTMLFormElement>(null)

  return (
    <form
      className='flex flex-wrap gap-4  items-end'
      ref={ref}
      action={async (formData) => {
        await formAction(formData)
        ref.current?.reset()
      }}
    >
      <div>
        <Label htmlFor="todo">Lenke *</Label>
        <Input type="url" id="originalURL" name="originalURL" autoComplete="off" required />
      </div>
      <div>
        <Label htmlFor="todo">Tittel</Label>
        <Input type="text" id="title" name="title" autoComplete="off" />
      </div>
      <div>
        <SubmitButton />
      </div>
      <p aria-live="polite" className="sr-only" role="status">
        {state?.message}
      </p>
    </form>
  )
}