import Link from "next/link";

export default function SourceLink({ url, label, suffix }: { url: string, label?: string, suffix?: string }) {

  if (!label) {
    let hostname = new URL(url).hostname
    hostname = hostname.replace(/^www\./, '');
    label = hostname
  }
  return (
    <Link className="no-underline hover:underline external-link" href={url}>{label}{suffix}</Link>
  )
}