
import React from 'react';
import Image from 'next/image';
import styles from './hit.module.css';

const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

export function HitCard({ hit }) {
  return (
    <article key={hit.objectID} className='relative flex flex-col flex-grow gap-y-3'>
      <a href={`https://chc-web.vercel.app/items/${hit.identifier}`} target='_blank' rel="noreferrer">
        {
          hit.image ? (
            <Image src={hit.image} alt='' width={300} height={300} className={styles.image} />
          ) : (
            <div className="min-h-64 p-10 inline-block flex-grow-1  w-full opacity-25 bg-gradient-to-r from-slate-500 to-yellow-100">
              No image found!
            </div>
          )
        }
      </a>

      <h2 className='text-lg font-bold'>
        <a href={`https://chc-web.vercel.app/items/${hit.identifier}`} target='_blank' rel="noreferrer">
          {/* <Highlight attribute="hit.label_none" hit={hit} /> */}
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
