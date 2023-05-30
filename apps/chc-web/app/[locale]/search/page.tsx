'use client'
import { InstantSearch, SearchBox, Hits, Stats, CurrentRefinements, Pagination, RefinementList } from "react-instantsearch-hooks-web";
import { HitCard } from 'components/pages/search/hit'
import createClient from "@searchkit/instantsearch-client";
import styles from './search-page.module.css'
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
            root: styles.searchBox,
            form: styles.searchForm,
            input: styles.searchInput,
            submitIcon: styles.searchSubmitIcon,
          }}
        />

        <div className={styles.grid}>
          <div>
            <RefinementList attribute="type" searchable />
            <h2>Skapere</h2>
            <RefinementList attribute="maker.label_none" searchable />
            <h2>Emner</h2>
            <RefinementList attribute="subject.label_none" searchable />
            <h2>Steder</h2>
            <RefinementList attribute="spatial.label_none" searchable />
          </div>

          <div>
            <Stats />
            <CurrentRefinements />

            <Pagination className={styles.pagination} />
            <Hits hitComponent={HitCard} />
            <Pagination className={styles.pagination} />
          </div>
        </div>
      </InstantSearch>
    </>
  );
}
