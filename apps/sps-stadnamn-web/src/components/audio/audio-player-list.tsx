import Link from "next/link";
import { PiArchive } from "react-icons/pi";

interface AudioPlayerListProps {
    recordings: any[];
    showArchiveLink?: boolean;
}

export default function AudioPlayerList({ recordings, showArchiveLink = false }: AudioPlayerListProps) {
    if (!Array.isArray(recordings) || recordings.length === 0) return null;

    return (
        <div>
            {recordings.map((recording: any, index: number) => {
                if (!recording?.file) return null;

                return (
                    <div key={`audio-${recording.uuid || `${recording.file}-${index}`}`} className="flex items-center p-2">
                        <audio
                            controls
                            aria-label={`Lydopptak${recordings.length > 1 ? ` ${index + 1} av ${recordings.length}` : ""}`}
                            src={`https://iiif.spraksamlingane.no/iiif/audio/hord/${recording.file}`}
                            className="h-10 rounded-md
                                [&::-webkit-media-controls-enclosure]:bg-transparent
                                [&::-webkit-media-controls-current-time-display]:text-neutral-800
                                [&::-webkit-media-controls-time-remaining-display]:text-neutral-800"
                        />
                        {showArchiveLink && recording.manifest && (
                            <Link href={`/iiif/${recording.manifest}`} className="ml-1 p-2 rounded-full aspect-square">
                                <PiArchive className="text-md text-neutral-800" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
