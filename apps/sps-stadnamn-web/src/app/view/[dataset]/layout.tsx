import SearchProvider from "@/app/search-provider"

export default function ViewLayout({ children, searchSection }: { children: React.ReactNode, searchSection: React.ReactNode } ) {  
  
    return (
              <main id="main" tabIndex={-1} className="flex xl:mb-2 xl:mx-2 flex-col xl:grid xl:grid-cols-3 xl:gap-1 scroll-container relative xl:static w-full h-full border-t border-neutral-400 xl:border-none">
                <SearchProvider>
                  {searchSection}
                <div className='card flex flex-col w-full h-full xl:col-span-2 xl:overflow-hidden'>
                  {children}
                </div>
                </SearchProvider>

              </main>
          
            )
          }
          
    