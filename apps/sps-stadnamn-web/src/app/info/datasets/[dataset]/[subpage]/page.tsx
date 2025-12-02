

import Breadcrumbs from '@/components/layout/breadcrumbs';
import { datasetTitles, subpages } from '@/config/metadata-config';
import fs from 'fs';
import { MDXRemote } from 'next-mdx-remote/rsc';
import path from 'path';

export async function generateMetadata({ params }: { params: Promise<{ dataset: string, subpage: number }> }) {
  const { dataset, subpage } = await params

  // Fetch first two  paragraph from article
  const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', dataset, 'article-' + subpage + ".mdx");
  const src = fs.readFileSync(filePath, 'utf8');

  const description = src.split('\r\n\r')?.[0].split("\n")?.slice(1).join("\n")

  return {
    title: datasetTitles[dataset],
    description
  }
}



export default async function SubPage({ params }: { params: Promise<{ dataset: string, subpage: number }> }) {
  const { dataset, subpage } = await params

  const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', dataset, 'article-' + subpage + ".mdx");
  const src = fs.readFileSync(filePath, 'utf8');


  return (
    <>
      <Breadcrumbs parentName={["Informasjon", "Datasett", datasetTitles[dataset]]} parentUrl={`/info/datasets/${dataset}`} currentName={subpages[dataset][subpage - 1]} />
      <MDXRemote source={src} />
    </>
  )
}