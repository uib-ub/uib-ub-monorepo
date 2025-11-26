import Link from "next/link";

export default function SourceLink({ url, label, suffix }: { url: string, label?: string, suffix?: string }) {
    
    if (!label) {
        let hostname = new URL(url).hostname
        hostname = hostname.replace(/^www\./, '');
        label = hostname
    }
    return (
      <Link className="px-1 rounded-md override-external-icon ml-2" href={url}>{label}{suffix}</Link>
    )
}