/* eslint-disable no-undef */
import React from 'react'
//import ReactPaginate from 'react-paginate'
import Search from './components/Search'
import { Box, Container } from '@sanity/ui'
import { SearchProvider } from './components/SearchProvider'
import { Items } from './components/Item'

const IMPORT_API_URL = 'https://kulturnav.org/api/search/'

export const initialState = {
  sourceAPI: 'kn',
  apiURL: IMPORT_API_URL,
  loading: true,
  searchParameter: '*',
  items: [],
  page: 0,
  totalElements: 0,
  max: 100,
  errorMessage: null,
  searchType: 'Concept',
  filter: ',concept.isCollection:!true',
  fromCollection: '',
  importTo: 'Concept'
}

const SearchKN = () => {
  return (
    <SearchProvider>
      <Container width={5}>
        <Box padding={4} marginTop={5}>
          <Search />

          {/* <Box marginBottom={3}>
          <ReactPaginate
            previousLabel={'previous'}
            nextLabel={'next'}
            breakLabel={'...'}
            forcePage={page}
            pageCount={totalElements / max}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            containerClassName={styles.pagination}
            pageClassName={styles.page}
            previousClassName={styles.previous}
            nextClassName={styles.next}
            breakClassName={styles.break}
            activeClassName={styles.active}
            onPageChange={handlePageClick}
          />
        </Box> */}

          <Items />
        </Box>
      </Container>
    </SearchProvider>
  )
}

export default SearchKN
