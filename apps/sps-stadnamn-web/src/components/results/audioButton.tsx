import { useState, useRef } from 'react';
import { PiPlayCircleFill, PiPauseCircleFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';

export default function AudioButton({ audioFile, className }: { audioFile: string, className: string }) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (audio.current) {
        if (playing) {
            audio.current.pause();
            setPlaying(false);   

        }
        else {
            audio.current.play();
            setPlaying(true); 
        }   
    }
  };

  return (
    <>
    <audio ref={audio} src={audioFile} onEnded={() => setPlaying(false)}/>
    <IconButton onClick={togglePlay} label={playing? "Pause" : "Spill av lyd"}>
      {playing ? <PiPauseCircleFill className={className} /> : <PiPlayCircleFill className={className} />}
    </IconButton>
    </>
  );
};