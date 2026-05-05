import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/uib-ub/items/accordion/components/accordion';
import Link from 'next/link';
import { IIIFImage } from '@/registry/uib-ub/items/iiif-image/components/iiif-image';
import { ArrowLeftCircleIcon } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className='@container mx-auto my-10'>
      <div className='fixed top-0 left-0 p-4 font-sans'>
        <Link href="/" className='flex items-center gap-2'>
          <ArrowLeftCircleIcon className='size-6' />
          Tilbake
        </Link>
      </div>
      <div className="content-grid ub-prose font-sans">

        <h1>Catharina Hermine Kølles reiser</h1>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>

        <div className='flex flex-col byline'>
          <p>
            Av: <Link href="https://www4.uib.no/finn-ansatte/tarje-saelen.lavik">Tarje Lavik</Link>
          </p>

          <p>
            Publisert: 18. mars 2026
          </p>
        </div>

        <p>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. An dicant apeirian qui, at vide indoctum pro.
        </p>

        <h2>Heading on level 2</h2>

        <p>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. An dicant apeirian qui, at vide indoctum pro.
        </p>
        <p>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. An dicant apeirian qui, at vide indoctum pro.
        </p>

        <dl className='horisontal-list'>
          <div>
            <dt>Kilde</dt>
            <dd>Wikipedia</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>Reisebeskrivelse</dd>
          </div>
          <div>
            <dt>Periode</dt>
            <dd>1826-1858</dd>
          </div>
        </dl>

        <p>
          Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <figure className='full'>
          <IIIFImage
            className='bg-uib-beige h-full aspect-video'
            src="https://iiif.wellcomecollection.org/image/b29346423_0006.jp2/full/full/0/default.jpg"
          />
          <figcaption>
            <p>Catharina Hermine Kølle, reiste til mange plasser i Europa. Alle stedene var det ulike stein og jordmasser som hun gikk på.</p>
          </figcaption>
        </figure>

        <p>
          Vivendum intellegat et qui, ei denique consequuntur vix. Tritani reprehendunt pro an, his ne liber iusto. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <p>
          Vivendum intellegat et qui, ei denique consequuntur vix. Tritani reprehendunt pro an, his ne liber iusto. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <h3>Heading on level 3</h3>
        <p>
          Vivendum intellegat et qui, ei denique consequuntur vix. Tritani reprehendunt pro an, his ne liber iusto. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <h4>Heading on level 4</h4>
        <p>
          Vivendum intellegat et qui, ei denique consequuntur vix. Tritani reprehendunt pro an, his ne liber iusto. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <h5>Heading on level 5</h5>
        <p>
          Vivendum intellegat et qui, ei denique consequuntur vix. Tritani reprehendunt pro an, his ne liber iusto. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <h6>Heading on level 6</h6>
        <p>
          Vivendum intellegat et qui, ei denique consequuntur vix. Tritani reprehendunt pro an, his ne liber iusto. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </p>

        <dl>
          <dt>Hvem var Catharina Hermine Kølle?</dt>
          <dd>Catharina Hermine Kølle (født 29. februar 1788 på Snarøya, død 27. august 1859 i Bergen) var en norsk vandrer, reiseskribent og maler, mest kjent for sine beretninger fra mange fotturer i landet og til Europa, såvel som over 250 akvareller som hun malte fra reisene.</dd>
          <dt>Hvorfor reiste Catharina Hermine Kølle?</dt>
          <dd>Catharina Hermine Kølle reiste for å se og beskrive naturen og kulturen i de landene hun besøkte.</dd>
        </dl>

        <h2>Heading on level 2</h2>

        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

        <Accordion className='not-ub-prose'>
          <AccordionItem>
            <AccordionTrigger>
              <h2>Hvem var Catharina Hermine Kølle?</h2>
            </AccordionTrigger>
            <AccordionContent>
              <p>Catharina Hermine Kølle (født 29. februar 1788 på Snarøya, død 27. august 1859 i Bergen) var en norsk vandrer, reiseskribent og maler, mest kjent for sine beretninger fra mange fotturer i landet og til Europa, såvel som over 250 akvareller som hun malte fra reisene.[6] Hun flyttet med faren Christian Kølle (lærer, prest og språkforsker, 1736–1814) og familien til Kopervik i 1803 og til Ulvik i 1807. Herfra reiste hun i 1826 til København, med seilskute fra Bergen. Men, mest gikk hun til fots, til Christiania (1854, 1856), Trondheim (1835, 1845 og 1850), Stockholm, Hamburg (1847), via Wien til Venezia (1841, 455 mil). Hennes siste tur gikk til Genova i 1858, året før hun døde av kreft. Hun var allerede syk og brukte tog på deler av turen.</p>
              <p>Kilde <Link href="https://no.wikipedia.org/wiki/Catharine_Hermine_K%C3%B8lle">Wikipedia</Link></p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem>
            <AccordionTrigger>
              <h2>Hvor reiste Catharina Hermine Kølle?</h2>
            </AccordionTrigger>
            <AccordionContent>
              <ul>
                <li>Danmark</li>
                <li>Sverige</li>
                <li>Tyskland</li>
                <li>Frankrike</li>
                <li>Italia</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}