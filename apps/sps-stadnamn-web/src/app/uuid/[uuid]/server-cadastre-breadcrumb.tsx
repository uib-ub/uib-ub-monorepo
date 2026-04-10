import Link from "next/link"

const toText = (value: unknown): string => {
  if (value == null) return ""
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ")
  }
  return String(value)
}

export default function ServerCadastreBreadcrumb({ source }: { source: Record<string, any> }) {
  const parentNumber = toText(source.gnr || source.mnr)
  const parentName = toText(source.parentLabel)
  const brukNumber = toText(source.bnr || source.lnr)
  const parentLabel = [parentNumber, parentName].filter(Boolean).join(" ")
  const currentName = [brukNumber, toText(source.label)].filter(Boolean).join(" ")

  return <div>
    <Link className="breadcrumb-link text-base"
      href={`/uuid/${source.within}`}>{parentLabel}
    </Link>
    <span className="mx-2">/</span>{currentName}</div>
}