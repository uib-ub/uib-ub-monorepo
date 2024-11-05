

import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs';
import path from 'path';
import { datasetTitles, subpages } from '@/config/metadata-config'
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export async function generateMetadata( { params }: { params: Promise<{ dataset: string, subpage: number }> }) {
  const { dataset, subpage } = await params
  let [mainIndex, subindex] = dataset.split("_")

  // Fetch first two  paragraph from article
  const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', mainIndex, 'article-' + subpage + ".mdx");
  const src = fs.readFileSync(filePath, 'utf8');

  const description = src.split('\r\n\r')?.[0].split("\n")?.slice(1).join("\n")

  return {
    title: `${subpages[mainIndex][subpage - 1]} - ${datasetTitles[mainIndex]}`,
    description
  }
}



export default async function SubPage ( { params }: { params: Promise<{ dataset: string, subpage: number }> }) {
    const { dataset, subpage } = await params
    let [mainIndex, subindex] = dataset.split("_")

    const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', mainIndex, 'article-' + subpage + ".mdx");
    const src = fs.readFileSync(filePath, 'utf8');


  return (
    <>
    <Breadcrumbs parentName={datasetTitles[mainIndex]} parentUrl={`/view/${dataset}/info`} currentName={subpages[mainIndex][subpage -1]} />
    <MDXRemote source={src} /> 
    </>
  )
}