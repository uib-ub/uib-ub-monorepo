import { useState, useEffect, useRef } from 'react';
import { PiPlayCircleFill, PiPauseCircleFill } from 'react-icons/pi';

export default function AudioButton({ audioFile, className }) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);

  const togglePlay = () => {

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
    <button onClick={togglePlay}>
      {playing ? <PiPauseCircleFill className={className} /> : <PiPlayCircleFill className={className} />}
    </button>
    </>
  );
};