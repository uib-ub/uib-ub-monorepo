'use client'

import { useRef } from 'react'
// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom'
// @ts-ignore
import { createShortLink } from '@/actions/link-action'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowDownIcon } from '@radix-ui/react-icons'

const initialState = {
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      className={`sm:w-[122px] ${pending ? 'cursor-not-allowed opacity-50' : ''
        }`}
    >
      <ArrowDownIcon className="w-5 h-5 mr-2" />
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
        formAction(formData)
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
      <output aria-live="polite" className="sr-only">
        {typeof state === 'object' && 'message' in state ? state.message : state}
      </output>
    </form>
  )
}