import { HeroCard } from '../components/hero-card';

export default function HeroCardDemo() {
  return (
    <div className='flex flex-column flex-wrap gap-5 m-5 w-full not-prose'>
      <HeroCard>
        <img src="https://data.ub.uib.no/files/bs/ubb/ubb-ms/ubb-ms-utst/ubb-ms-utst-0058/jpg/ubb-ms-utst-0058_md.jpg" alt="Catharina Hermine Kølle" />
        <div>
          <h2>Hvem var Catharina Hermine Kølle?</h2>
          <p>Catharina Hermine Kølle (født 29. februar 1788 på Snarøya, død 27. august 1859 i Bergen) var en norsk vandrer, reiseskribent og maler.</p>
        </div>
      </HeroCard>
    </div>
  );
}