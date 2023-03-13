export const revalidate = 30;

import React from 'react';
import Image from 'next/image'
import { ArrowRightIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { LinksRecord, XataClient } from '../utils/xata';
import styles from './Links.module.css'

const xata = new XataClient();

async function getData() {
  return await xata.db.links.getAll()
}

const Links = async () => {
  const data: LinksRecord[] = await getData();

  return (
    <div className={styles.wrapper}>
      {data && data.map((link: LinksRecord) => (
        <div key={link.id} className={styles.link}>
          <div className='content'>
            <div className='font-black text-xl'>{link.title || 'No title'}</div>
            <div className='text-sm'>
              <a href={`https://${link.domain}/${link.path}`}>
                {`https://${link.domain}/${link.path}`}
              </a> <ArrowRightIcon className={styles.icon} /> <strong>redirects to</strong> <ArrowRightIcon className={styles.icon} />
              <a href={link.originalURL} target='_blank' rel='noreferrer' className='flex items-baseline'>
                {link.originalURL} <ArrowTopRightOnSquareIcon className={styles.icon} />
              </a>
              <p>Views: {link.views}</p>
            </div>
          </div>
          <Image alt='' className='' width={150} height={150} src={`data:image/svg+xml;utf8,${encodeURIComponent(link.qr)}`} />
        </div>
      ))}
    </div>
  )
}

export default Links