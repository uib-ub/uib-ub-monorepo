
import React, { useState } from 'react';
import { connectHits, connectStateResults, connectSearchBox, InstantSearch, CurrentRefinements, Stats, RefinementList, Pagination, ClearRefinements, ScrollTo } from "react-instantsearch-dom";
import { searchkitClient } from './searchkitConfig'
import { uniqBy } from 'lodash';
import { useRouter } from 'next/navigation';
import { HitList, HitCard } from './Hit'
import { SearchBox } from './SearchBox'
import * as Switch from '@radix-ui/react-switch';
import styles from './SearchKit.module.css'

const CustomHitsList = connectHits(HitList);
const CustomHitsCard = connectHits(HitCard);
const DebouncedSearchBox = connectSearchBox(SearchBox)

function deduplicate(items) {
  return uniqBy(items, item => item.attribute);
}

export default function SearchKit() {
  const { locale } = useRouter()
  const [listViewer, toggleListViewer] = useState(false)

  const onOptionChange = e => {
    toggleListViewer(!listViewer)
  }

  const LoadingIndicator = connectStateResults(({ isSearchStalled }) =>
    isSearchStalled ? 'Loading...' : null
  )

  return (
    <>
      <div className='flex gap-3'>
        <a href='https://chc-web.vercel.app/' className='text-lg font-bold'>← CHC-WEB</a>
      </div>
      <InstantSearch
        searchClient={searchkitClient}
        indexName="marcus-demo"
      >
        <DebouncedSearchBox delay={600} showLoadingIndicator />

        <LoadingIndicator />

        <div style={{ display: 'flex', gap: '2em', width: '100%' }}>
          <div style={{ width: '20%' }}>
            <ClearRefinements />
            <form>
              <div className='flex my-3 items-center'>
                <label className={styles.Label} htmlFor="viewer" style={{ paddingRight: 15 }}>
                  Card view
                </label>
                <Switch.Root className={styles.SwitchRoot} id="viewer" onCheckedChange={onOptionChange}>
                  <Switch.Thumb className={styles.SwitchThumb} />
                </Switch.Root>
                <label className={styles.Label} htmlFor="viewer" style={{ paddingLeft: 15 }}>
                  List view
                </label>
              </div>
            </form>

            <RefinementList attribute="type" searchable />
            <h2>Skapere</h2>
            <RefinementList attribute="maker.label_none" searchable />
            <h2>Emner</h2>
            <RefinementList attribute="subject.label_none" searchable />
            {/* <HierarchicalMenu
              attributes={[
                'hierarchicalPlaces.lvl0',
                'hierarchicalPlaces.lvl1',
                'hierarchicalPlaces.lvl2',
              ]}
              defaultRefinement="Bergen"
            /> */}

            <h2>Steder</h2>
            <RefinementList attribute="spatial.label_none" searchable />

          </div>
          <div style={{ width: '80%' }}>
            <Stats />
            <CurrentRefinements
              transformItems={items => deduplicate(items)}
            />
            <Pagination />

            <ScrollTo>
              {listViewer ? <CustomHitsList /> : <CustomHitsCard />}
            </ScrollTo>
            <Pagination />
          </div>
        </div>
      </InstantSearch>
    </>
  )
}