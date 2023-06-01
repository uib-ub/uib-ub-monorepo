'use client'
import { InstantSearch, SearchBox, Hits, Stats, CurrentRefinements, Pagination, RefinementList } from "react-instantsearch-hooks-web";
import { HitCard } from 'components/pages/search/hit'
import createClient from "@searchkit/instantsearch-client";
import 'instantsearch.css/themes/satellite-min.css';

const searchClient = createClient({
  url: "/api/search",
});

export default function SearchPage() {
  return (
    <>
      <InstantSearch
        searchClient={searchClient}
        indexName="marcus-demo"
        routing={true}
      >
        <SearchBox
          classNames={{
            root: 'my-5',
            form: '',
            input: 'dark:bg-gray-300',
            submitIcon: '',
          }}
        />

        <div className='grid grid-cols-4 gap-5'>
          <div className='col-span-1 flex flex-col gap-3'>
            <RefinementList
              attribute="type"
              searchable
            />
            <h2>Skapere</h2>
            <RefinementList
              attribute="maker.label_none"
              searchable
            />
            <h2>Emner</h2>
            <RefinementList
              attribute="subject.label_none"
              searchable
            />
            <h2>Steder</h2>
            <RefinementList
              attribute="spatial.label_none"
              searchable
            />
          </div>

          <div className='col-span-3'>
            <Stats />
            <CurrentRefinements />

            <Pagination />
            <Hits
              hitComponent={HitCard}
              classNames={{
                root: '',
                list: '',
              }}
            />
            <Pagination />
          </div>
        </div>
      </InstantSearch>
    </>
  );
}
