'use client'
import { useState, useRef } from 'react';
import { PiPlayCircleFill, PiPauseCircleFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';

export default function AudioButton({ audioFile, iconClass }: { audioFile: string, iconClass: string }) {
  const [playing, setPlaying] = useState<string|null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (audio.current) {
        if (playing) {
            audio.current.pause();
            setPlaying(null);   

        }
        else {
            audio.current.play();
            setPlaying(audioFile); 
        }   
    }
  };

  return (
    <>
    <audio ref={audio} src={audioFile} onEnded={() => setPlaying(null)}/>
    <IconButton onClick={togglePlay} label={playing? "Pause" : "Spill av lyd"}>
      {playing == audioFile  ? <PiPauseCircleFill className={"align-text-bottom " + iconClass} /> : <PiPlayCircleFill className={iconClass} />}
    </IconButton>
    </>
  );
};