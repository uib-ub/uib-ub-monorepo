 "use client";
 
 import { useEffect, useRef, useState } from "react";
 import { PiPlayFill, PiStopFill } from "react-icons/pi";
 
 type Recording = {
     uuid?: string;
     file?: string;
 };
 
 export default function AudioPreviewButtons({
     recordings,
     className,
 }: {
     recordings: Recording[] | undefined;
     className?: string;
 }) {
     const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
     const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
 
     useEffect(() => {
         return () => {
             if (audioPreviewRef.current) {
                 audioPreviewRef.current.pause();
                 audioPreviewRef.current = null;
             }
         };
     }, []);
 
     const safeRecordings = (Array.isArray(recordings) ? recordings : []).filter((r) => !!r?.file);
     if (safeRecordings.length === 0) return null;
 
     const handlePlayAudio = (recording: Recording, fallbackId: string) => {
         const id = String(recording.uuid || fallbackId);
 
         // Toggle pause if the same recording is already playing
         if (audioPreviewRef.current && playingPreviewId === id) {
             if (!audioPreviewRef.current.paused) {
                 audioPreviewRef.current.pause();
                 setPlayingPreviewId(null);
                 return;
             }
         }
 
         // Stop any previous preview
         if (audioPreviewRef.current) {
             audioPreviewRef.current.pause();
             audioPreviewRef.current = null;
         }
 
         const audio = new Audio(`https://iiif.spraksamlingane.no/iiif/audio/hord/${recording.file}`);
         audioPreviewRef.current = audio;
         setPlayingPreviewId(id);
 
         audio.addEventListener("ended", () => {
             setPlayingPreviewId((current) => (current === id ? null : current));
         });
 
         audio.play().catch((error) => {
             // Ignore AbortError caused by a pause() interrupting play()
             if ((error as any)?.name === "AbortError") {
                 return;
             }
             console.error(error);
             setPlayingPreviewId((current) => (current === id ? null : current));
         });
     };
 
     return (
         <div className={`flex gap-1 flex-shrink-0 ${className ?? ""}`}>
             {safeRecordings.map((recording, index) => {
                 const id = String(recording.uuid || `${recording.file}-${index}`);
                 const isPlaying = playingPreviewId === id;
                 return (
                     <button
                         key={`audio-preview-${id}`}
                         type="button"
                         onClick={() => handlePlayAudio(recording, `${recording.file}-${index}`)}
                         className="rounded-full text-neutral-900 border border-neutral-200 rounded-full p-2"
                         aria-label={`Lydopptak${safeRecordings.length > 1 ? ` ${index + 1} av ${safeRecordings.length}` : ""}${
                             isPlaying ? " (stoppar)" : ""
                         }`}
                         aria-pressed={isPlaying}
                     >
                         {isPlaying ? (
                             <PiStopFill className="text-lg" aria-hidden="true" />
                         ) : (
                             <PiPlayFill className="text-lg" aria-hidden="true" />
                         )}
                     </button>
                 );
             })}
         </div>
     );
 }
