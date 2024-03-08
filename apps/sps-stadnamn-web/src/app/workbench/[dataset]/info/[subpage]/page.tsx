

import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs';
import path from 'path';
import { datasetTitles, subpages } from '@/config/client-config'
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function SubPage ( { params }: { params: { dataset: string, subpage: number } }) {
    let [mainIndex, subindex] = params.dataset.split("_")

    const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', mainIndex, 'article-' + params.subpage + ".mdx");
    const src = fs.readFileSync(filePath, 'utf8');


  return (
    <>
    <Breadcrumbs parentName={datasetTitles[mainIndex]} parentUrl={`/workbench/${params.dataset}/info`} currentName={subpages[mainIndex][params.subpage -1]} />
    <MDXRemote source={src} /> 
    </>
  )
}