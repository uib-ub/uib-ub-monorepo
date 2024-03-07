import SearchProvider from "@/app/search-provider"
export default function WorkbenchLayout({ children, searchSection }: { children: React.ReactNode, searchSection: React.ReactNode } ) {  
    return (
              <main className="search-view flex flex-col lg:grid lg:grid-cols-3 mb-3 lg:mx-2 gap-2">
                <SearchProvider>
                <section className="flex stable-scrollbar pl-2 flex-col lg:col-span-1 card gap-3 bg-white shadow-md py-2 pt-4 lg:overflow-y-auto h-full" aria-label="Søkepanel">
                    {searchSection}

                </section>
          
                <section className='card flex flex-col w-full aspect-square lg:col-span-2 lg:h-full lg:overflow-hidden'>
                  {children}
                </section>
                </SearchProvider>

              </main>
          
            )
          }
          
    