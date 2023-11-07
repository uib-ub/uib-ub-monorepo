import { default as UiBIcon } from '../../components/uib-icon'

export default async function Home() {
  return (
    <main className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12 flex flex-col flex-grow gap-10'>
      <UiBIcon className='w-1/3 md:w-60 mx-auto' />
      <h1 className='text-4xl md:text-6xl'>UB dashboard</h1>
      <p className='text-3xl font-bold leading-tight max-w-xl'>
        Oversikt over det som er viktigst; mennesker og relasjoner og historikk og sånt 😊.
      </p>
    </main>
  )
}
