import SearchProvider from "@/app/search-provider"
export default function WorkbenchLayout({ children, searchSection }: { children: React.ReactNode, searchSection: React.ReactNode } ) {  
    return (
              <main className="flex flex-col xl:grid xl:grid-cols-3 mb-3 xl:mx-2 gap-2 scroll-container">
                <SearchProvider>
                <section className="flex flex-col xl:col-span-1 card gap-3 bg-white shadow-md py-2 pt-4 md:px-8 xl:px-1 stable-scrollbar xl:overflow-y-auto h-full border" aria-label="Søkepanel">
                    {searchSection}

                </section>
          
                <section className='card flex flex-col w-full aspect-square xl:col-span-2 xl:h-full xl:overflow-hidden border'>
                  {children}
                </section>
                </SearchProvider>

              </main>
          
            )
          }
          
    