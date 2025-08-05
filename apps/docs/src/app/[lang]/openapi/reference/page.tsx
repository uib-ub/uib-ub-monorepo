import { ClientWrapper } from '@/app/_components/openapi'

export async function generateStaticParams() {
  return [
    { lang: 'nb' },
    { lang: 'en' },
  ];
}

export default function ReferencePage() {
  return (
    <div className="max-h-[calc(100%-10rem)]">
      <ClientWrapper />
    </div>
  )
}
