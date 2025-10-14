import Link from "next/link";

export default function SourceLink({ url, label, suffix }: { url: string, label?: string, suffix?: string }) {
    
    if (!label) {
        let hostname = new URL(url).hostname
        hostname = hostname.replace(/^www\./, '');
        label = hostname
    }
    return (
      <Link className="bg-neutral-200 px-1 rounded-md override-external-icon mx-1 no-underline" href={url}>{label}{suffix}</Link>
    )
}