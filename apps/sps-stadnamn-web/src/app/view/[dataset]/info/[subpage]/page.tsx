

import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs';
import path from 'path';
import { datasetTitles, subpages } from '@/config/metadata-config'
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export async function generateMetadata( { params }: { params: { dataset: string, subpage: number } }) {

  // Fetch first two  paragraph from article
  const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', params.dataset, 'article-' + params.subpage + ".mdx");
  const src = fs.readFileSync(filePath, 'utf8');

  const description = src.split('\r\n\r')?.[0].split("\n")?.slice(1).join("\n")

  return {
    title: `${datasetTitles[params.dataset]} - ${subpages[params.dataset][params.subpage - 1]}`,
    description
  }
}



export default function SubPage ( { params }: { params: { dataset: string, subpage: number } }) {
    let [mainIndex, subindex] = params.dataset.split("_")

    const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', mainIndex, 'article-' + params.subpage + ".mdx");
    const src = fs.readFileSync(filePath, 'utf8');


  return (
    <>
    <Breadcrumbs parentName={datasetTitles[mainIndex]} parentUrl={`/view/${params.dataset}/info`} currentName={subpages[mainIndex][params.subpage -1]} />
    <MDXRemote source={src} /> 
    </>
  )
}