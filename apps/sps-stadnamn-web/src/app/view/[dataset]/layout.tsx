import SearchProvider from "@/app/search-provider"

import { datasetTitles, datasetDescriptions } from '@/config/metadata-config'

export async function generateMetadata( { params }: { params: { dataset: string } }) {
  return {
    title: datasetTitles[params.dataset],
    description: datasetDescriptions[params.dataset]
  }
}

export default function ViewLayout({ children, searchSection }: { children: React.ReactNode, searchSection: React.ReactNode } ) {  
  
    return (
              <main id="main" tabIndex={-1} className="flex xl:mb-2 xl:mx-2 flex-col xl:grid xl:grid-cols-3 xl:gap-1 scroll-container relative xl:static h-full border-t border-neutral-400 xl:border-none">
                <SearchProvider>
                  {searchSection}
                <div className='card flex flex-col w-full h-full xl:col-span-2 scroll-container'>
                  {children}
                </div>
                </SearchProvider>

              </main>
          
            )
          }
          
    