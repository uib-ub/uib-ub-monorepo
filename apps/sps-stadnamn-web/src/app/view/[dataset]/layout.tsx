import SearchProvider from "@/app/search-provider"
export default function ViewLayout({ children, searchSection }: { children: React.ReactNode, searchSection: React.ReactNode } ) {  
    return (
              <main className="flex flex-col xl:grid xl:grid-cols-3 mb-3 xl:mx-2 gap-2 scroll-container w-full h-full">
                <SearchProvider>
                <section className="flex flex-col xl:col-span-1 card gap-3 bg-white py-2 pt-4 md:px-8 xl:px-2 stable-scrollbar xl:overflow-y-auto " aria-label="Søkepanel">
                    {searchSection}

                </section>
          
                <section className='card flex flex-col w-full h-full xl:col-span-2 xl:overflow-hidden'>
                  {children}
                </section>
                </SearchProvider>

              </main>
          
            )
          }
          
    