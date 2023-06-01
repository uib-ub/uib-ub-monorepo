
import React from 'react';
import Image from 'next/image';
import Link from 'next-intl/link';

const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

export function HitCard({ hit }) {
  return (
    <article key={hit.objectID} className='relative flex flex-col flex-grow gap-y-3'>
      <Link href={`/items/${hit.identifier}`}>
        {
          hit.image ? (
            <Image src={hit.image} alt='' width={300} height={300} />
          ) : (
            <div className="min-h-64 p-10 inline-block flex-grow-1  w-full opacity-25 bg-gradient-to-r from-slate-500 to-yellow-100">
              No image found!
            </div>
          )
        }
      </Link>

      <h2 className='text-lg font-bold'>
        <a href={`/items/${hit.identifier}`}>
          {hit.label_none ?? hit.label?.no}
        </a>
      </h2>
      {hit.description_none ?? hit.description?.no ? (
        <>
          <div className='text-sm font-serif'>{renderHTML(hit.description_none ?? hit.description?.no)}</div>
        </>
      ) : null}

      <a href={`https://projectmirador.org/embed/?manifest=${hit.subjectOfManifest}`} target="_blank" rel='noreferrer'>Open in Mirador</a>

      <a href={hit.homepage} target="_blank" rel='noreferrer'>Open in Marcus</a>

      <div className='font-bold text-lg'>
        {hit.maker?.map(m => (
          <div key={m.id}>
            {m.label_none}
          </div>
        ))}
      </div>

      <div className='my-1 flex flex-wrap gap-2'>
        {Array.isArray(hit.type) ? hit.type.map(t => (
          <div key={t} className=' px-2 bg-green-600 text-white rounded'>{t}</div>
        )) : [hit.type].map(t => (
          <div key={t} className=' px-2 bg-green-600 text-white rounded'>{t}</div>
        ))}
      </div>

      <div className='my-1 inline-block px-2 bg-neutral-600 text-white rounded'>{hit.identifier}</div>
    </article>
  );
}
