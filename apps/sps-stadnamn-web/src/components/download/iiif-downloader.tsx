'use client'
import { jsPDF } from 'jspdf'
import { useEffect, useRef, useState } from 'react'
// eslint-disable-next-line import/no-unresolved
import { resolveLanguage } from '@/app/iiif/iiif-utils'
import JSZip from 'jszip'

type ManifestImage = { uuid: string; width: number; height: number; label?: any }

type ViewerJob = {
  kind: 'viewer'
  manifestId: string
  manifestDataset: string
  images: ManifestImage[]
  format: 'jpg' | 'pdf'
  pageIndex?: number // used for jpg or single-page pdf
  filename?: string
}

type CollectionJob = {
  kind: 'collection'
  collectionUuid: string
  format: 'jpgs' | 'multipdf' | 'pdf'
  filename?: string
}

export default function IIIFDownloader({ job, onDone }: { job: ViewerJob | CollectionJob, onDone?: () => void }) {
  const [status, setStatus] = useState<string>('Førebur nedlasting…')
  const startedRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    abortRef.current = new AbortController()
    const run = async () => {
      try {
        if (job.kind === 'viewer') {
          if (job.format === 'jpg') {
            await downloadSingleJpg(job, abortRef.current!.signal, setStatus)
          } else if (job.format === 'pdf') {
            await downloadViewerPdf(job, abortRef.current!.signal, setStatus)
          }
        } else if (job.kind === 'collection') {
          if (job.format === 'jpgs') {
            await downloadCollectionJpgs(job, setStatus, abortRef.current!.signal, cancelledRef)
          } else if (job.format === 'multipdf') {
            await downloadCollectionMultiPdf(job, setStatus, abortRef.current!.signal, cancelledRef)
          } else if (job.format === 'pdf') {
            await downloadCollectionSinglePdf(job, setStatus, abortRef.current!.signal, cancelledRef)
          }
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') console.error(e)
      } finally {
        onDone?.()
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/40">
      <div className="rounded-md bg-white px-6 py-4 shadow-lg text-center flex flex-col gap-3">
        <div className="font-semibold">{status}</div>
        <div>
          <button
            className="btn btn-outline"
            onClick={() => {
              cancelledRef.current = true
              abortRef.current?.abort()
              setStatus('Avbrote')
            }}
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}

function imageUrl(dataset: string, uuid: string) {
  return `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${dataset.toUpperCase()}/${uuid}/full/max/0/default.jpg`
}

function arrayBufferToBase64(ab: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(ab)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    binary += String.fromCharCode.apply(null, Array.from(chunk) as any)
  }
  return btoa(binary)
}

async function fetchAsBase64(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  const buf = await res.arrayBuffer()
  const base64 = arrayBufferToBase64(buf)
  return `data:image/jpeg;base64,${base64}`
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadSingleJpg(job: ViewerJob, signal?: AbortSignal, setStatus?: (s: string) => void) {
  const page = job.pageIndex ?? 0
  const img = job.images[page]
  const res = await fetch(imageUrl(job.manifestDataset, img.uuid), { signal })
  if (!res.ok) throw new Error('Failed to fetch image')
  const ab = await res.arrayBuffer()
  const blob = new Blob([new Uint8Array(ab)], { type: 'image/jpeg' })
  setStatus?.('Startar nedlasting…')
  triggerDownload(blob, `${job.filename || 'download'}.jpg`)
}

async function downloadViewerPdf(job: ViewerJob, signal?: AbortSignal, setStatus?: (s: string) => void) {
  const pages = job.pageIndex != null ? [job.images[job.pageIndex]] : job.images
  if (!pages?.length) throw new Error('No pages')

  const first = pages[0]
  const pdf = new jsPDF({
    orientation: first.width > first.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [first.width, first.height],
  })
  for (let i = 0; i < pages.length; i++) {
    const c = pages[i]
    const base64 = await fetchAsBase64(imageUrl(job.manifestDataset, c.uuid), signal)
    if (i > 0) pdf.addPage([c.width, c.height])
    pdf.addImage(base64, 'JPEG', 0, 0, c.width, c.height)
  }
  const ab = pdf.output('arraybuffer') as ArrayBuffer
  const blob = new Blob([ab], { type: 'application/pdf' })
  setStatus?.('Startar nedlasting…')
  triggerDownload(blob, `${job.filename || 'download'}.pdf`)
}

async function fetchCollectionChildren(collectionUuid: string, setStatus?: (s: string) => void, signal?: AbortSignal) {
  setStatus?.('Hentar element frå samlinga…')
  const params = new URLSearchParams({ collection: collectionUuid, size: '5000' })
  const res = await fetch(`/api/iiif/search?${params.toString()}`, { signal })
  if (!res.ok) throw new Error('Failed to fetch collection items')
  const json = await res.json()
  const hits: any[] = json?.hits?.hits || []
  return hits.filter(h => h?._source?.type === 'Manifest')
}

async function downloadCollectionJpgs(job: CollectionJob, setStatus: (s: string) => void, signal?: AbortSignal, cancelledRef?: React.MutableRefObject<boolean>) {
  const hits = await fetchCollectionChildren(job.collectionUuid, setStatus, signal)
  if (!hits.length) throw new Error('Collection is empty')
  const zip = new JSZip()
  for (let h = 0; h < hits.length; h++) {
    const hit = hits[h]
    if (cancelledRef?.current) throw new DOMException('Aborted', 'AbortError')
    const itemDataset = hit._index.split('-')[2].split('_')[1]
    const images: ManifestImage[] = hit._source?.images || []
    const manifestFolderName = (resolveLanguage(hit._source?.label) || hit._source?.uuid || 'manifest') as string
    const folder = zip.folder(manifestFolderName) as any

    for (let i = 0; i < images.length; i++) {
      if (cancelledRef?.current) throw new DOMException('Aborted', 'AbortError')
      const pageSuffix = images.length > 1 ? `: bilete ${i + 1}/${images.length}` : ''
      setStatus(`(${h + 1}/${hits.length}) ${manifestFolderName}${pageSuffix}`)
      const img = images[i]
      const resp = await fetch(imageUrl(itemDataset, img.uuid), { signal })
      if (!resp.ok) continue
      const buffer = await resp.arrayBuffer()
      const label = (img as any).label?.none || (img as any).label?.no || (img as any).label?.en || (img as any).label
      const filename = `${(Array.isArray(label) ? label[0] : label) || String(i + 1).padStart(4, '0')}.jpg`
      folder.file(filename, new Uint8Array(buffer))
    }
  }
  setStatus('Pakkar ZIP… 0%')
  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      setStatus(`Pakkar ZIP… ${metadata.percent.toFixed(0)}%`)
    }
  )
  setStatus('Startar nedlasting…')
  triggerDownload(zipBlob, `${job.filename || 'download'}-jpgs.zip`)
}

async function downloadCollectionMultiPdf(job: CollectionJob, setStatus: (s: string) => void, signal?: AbortSignal, cancelledRef?: React.MutableRefObject<boolean>) {
  const hits = await fetchCollectionChildren(job.collectionUuid, setStatus, signal)
  const zip = new JSZip()
  for (let h = 0; h < hits.length; h++) {
    const hit = hits[h]
    if (cancelledRef?.current) throw new DOMException('Aborted', 'AbortError')
    const itemDataset = hit._index.split('-')[2].split('_')[1]
    const images: ManifestImage[] = hit._source?.images || []
    if (!images.length) continue
    const manifestName = (resolveLanguage(hit._source?.label) || hit._source?.uuid || 'manifest') as string

    const first = images[0]
    const pdf = new jsPDF({
      orientation: first.width > first.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [first.width, first.height],
    })
    for (let i = 0; i < images.length; i++) {
      if (cancelledRef?.current) throw new DOMException('Aborted', 'AbortError')
      const pageSuffix = images.length > 1 ? ` (${i + 1}/${images.length})` : ''
      setStatus(`(${h + 1}/${hits.length}) Lagar PDF: ${manifestName}${pageSuffix}`)
      const c = images[i]
      const base64 = await fetchAsBase64(imageUrl(itemDataset, c.uuid), signal)
      if (i > 0) pdf.addPage([c.width, c.height])
      pdf.addImage(base64, 'JPEG', 0, 0, c.width, c.height)
    }
    const pdfAb = pdf.output('arraybuffer') as ArrayBuffer
    zip.file(`${manifestName}.pdf`, new Uint8Array(pdfAb))
  }
  setStatus('Pakkar ZIP… 0%')
  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      setStatus(`Pakkar ZIP… ${metadata.percent.toFixed(0)}%`)
    }
  )
  setStatus('Startar nedlasting…')
  triggerDownload(zipBlob, `${job.filename || 'download'}-pdfs.zip`)
}

async function downloadCollectionSinglePdf(job: CollectionJob, setStatus: (s: string) => void, signal?: AbortSignal, cancelledRef?: React.MutableRefObject<boolean>) {
  const hits = await fetchCollectionChildren(job.collectionUuid, setStatus, signal)
  // Flatten canvases with dataset
  const items: { width: number; height: number; uuid: string; dataset: string }[] = []
  for (const hit of hits) {
    if (cancelledRef?.current) throw new DOMException('Aborted', 'AbortError')
    const itemDataset = hit._index.split('-')[2].split('_')[1]
    const images: ManifestImage[] = hit._source?.images || []
    for (const img of images) {
      items.push({ width: img.width, height: img.height, uuid: img.uuid, dataset: itemDataset })
    }
  }
  if (!items.length) throw new Error('No images found in collection')

  const first = items[0]
  const pdf = new jsPDF({
    orientation: first.width > first.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [first.width, first.height],
  })
  for (let i = 0; i < items.length; i++) {
    if (cancelledRef?.current) throw new DOMException('Aborted', 'AbortError')
    setStatus(`Lagar samla PDF: side ${i + 1}/${items.length}`)
    const c = items[i]
    const base64 = await fetchAsBase64(imageUrl(c.dataset, c.uuid), signal)
    if (i > 0) pdf.addPage([c.width, c.height])
    pdf.addImage(base64, 'JPEG', 0, 0, c.width, c.height)
  }
  const pdfAb = pdf.output('arraybuffer') as ArrayBuffer
  const blob = new Blob([pdfAb], { type: 'application/pdf' })
  setStatus('Startar nedlasting…')
  triggerDownload(blob, `${job.filename || 'download'}.pdf`)
}


