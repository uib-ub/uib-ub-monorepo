import { PiArchive, PiBookOpen, PiCaretLeft, PiCaretRight, PiLinkSimple, PiCheck } from "react-icons/pi";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { useState } from "react";
import IconLink from "../ui/icon-link";
import IconButton from "../ui/icon-button";

/*
Example with more than one recording
http://localhost:3000/search?nav=results&facet=datasets&datasets=hord&center=59.97407120119033%2C8.756103515625&zoom=7&doc=03d42cc3-af24-3b21-acbc-f69973c9bcd7&parent=03d42cc3-af24-3b21-acbc-f69973c9bcd7

*/

export default function AudioExplorer({recordings}: {recordings: any[]}) {
    const [recordingIndex, setRecordingIndex] = useState(0)
    const [copiedId, setCopiedId] = useState<string|null>(null)
    const recording = recordings[recordingIndex]

    const handleCopy = async () => {
        await navigator?.clipboard.writeText(`https://stadnamn.no/iiif/${recording.manifest}`)
        setCopiedId(recording.manifest)
    }

    return <div className="w-full flex flex-col px-2">
      {JSON.stringify(recording)}
    <audio 
      controls 
      src={`https://iiif.test.ubbe.no/iiif/audio/hord/${recording.file}`}
      className="h-10  rounded-md mt-2 w-full
      
        [&::-webkit-media-controls-enclosure]:bg-transparent 
        [&::-webkit-media-controls-current-time-display]:text-neutral-800 
        [&::-webkit-media-controls-time-remaining-display]:text-neutral-800 
        t"
        
    />
    <div className="flex py-2 gap-2">
      <ClickableIcon label={'Kjelde: Hordanamn'} add={{doc: recording.uuid}} remove={["sourceLabel", "sourceDataset"]} className="btn btn-outline">
       
      <PiBookOpen className="text-lg text-neutral-800" aria-hidden="true"/>
      </ClickableIcon>
      <IconLink label={'Varig arkivside'} href={`/iiif/${recording.manifest}`} className="btn btn-outline">
       
      <PiArchive className="text-lg text-neutral-800" aria-hidden="true"/>
      </IconLink>

      <IconButton 
        label={copiedId === recording.manifest ? "Lenke kopiert" : "Kopier varig lenke"} 
        onClick={handleCopy} 
        disabled={copiedId === recording.manifest}
        className="btn btn-outline"
      >
        {copiedId === recording.manifest ? (
          <PiCheck className="text-lg text-neutral-800" aria-hidden="true"/>
        ) : (
          <PiLinkSimple className="text-lg text-neutral-800" aria-hidden="true"/>
        )}
      </IconButton>

      {recordings.length > 1 && <div className="flex items-center gap-4 ml-auto">
      <IconButton 
        label="Forrige" 
        onClick={() => setRecordingIndex(Math.max(0, recordingIndex - 1))} 
        disabled={recordingIndex === 0}
        className="btn btn-outline"
      >
        <PiCaretLeft className="text-lg" aria-hidden="true"/>
      </IconButton>
      <span className="text-neutral-500 flex items-center justify-center">
        {recordingIndex + 1}/{recordings.length}
      </span>
      <IconButton 
        label="Neste" 
        onClick={() => setRecordingIndex(Math.min(recordings.length - 1, recordingIndex + 1))}
        disabled={recordingIndex === recordings.length - 1} 
        className="btn btn-outline"
      >
        <PiCaretRight className="text-lg" aria-hidden="true"/>
      </IconButton>
      </div>
      }



    </div>
    </div>
}