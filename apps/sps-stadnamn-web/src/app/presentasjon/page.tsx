'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { validatePassword } from './actions'

export default function PresentationLogin() {
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await validatePassword(formData)
    
    if (result.success) {
      document.cookie = 'presentationAuth=true; max-age=86400; path=/'
      router.push('/presentasjon/historiedagar2025')
    } else {
      alert('Ugyldig kode')
    }
  }

  return (
    <div className="flex py-12 flex-col gap-4 items-center">
      <h1 className="">Presentasjon</h1>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="input"
          name="password"
          className="border p-2 rounded-md"
          placeholder="Skriv inn kode"
        />
        <button 
          type="submit"
          className="btn btn-primary"
        >
          Logg inn
        </button>
      </form>
    </div>
  )
}
