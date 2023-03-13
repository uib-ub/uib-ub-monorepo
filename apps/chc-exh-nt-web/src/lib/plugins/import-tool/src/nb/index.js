/* eslint-disable no-undef */
import React, { useReducer, useEffect } from 'react'
import ReactPaginate from 'react-paginate'
// import fetch from 'unfetch'
import Card from './components/Card'
import Search from './components/Search'
import styles from '../ImportTool.module.css'
import { chooseItem } from './apis'
import { Box, Card as SanityCard, Container, Grid, Flex, Text, Spinner } from '@sanity/ui'
import { searchReducer } from '../shared/searchReducer'

const IMPORT_API_URL = 'https://api.nb.no/catalog/v1/items/?'

export const initialState = {
  sourceAPI: 'nb',
  apiURL: 'https://api.nb.no/catalog/v1/items/?',
  loading: true,
  searchParameter: '',
  items: [],
  page: 0,
  totalElements: 0,
  limit: 30,
  errorMessage: null,
}

const SearchNB = () => {
  const [state, dispatch] = useReducer(searchReducer, initialState)

  useEffect(() => {
    fetch(
      state.apiURL +
      new URLSearchParams({
        page: state.page,
        size: state.limit,
        digitalAccessibleOnly: true,
        filter: "contentClasses%3Ajp2"
      }),
    )
      .then((response) => response.json())
      .then((jsonResponse) => {
        dispatch({
          type: 'SEARCH_SUCCESS',
          payload: jsonResponse._embedded.items,
          totalElements: jsonResponse.page.totalElements,
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePageClick = (data) => {
    let selected = data.selected
    let page = selected

    dispatch({
      type: 'SEARCH_REQUEST',
      searchParameter: state.searchParameter,
    })

    fetch(
      state.apiURL +
      new URLSearchParams({
        q: state.searchParameter ? state.searchParameter : '',
        page: page,
        size: state.limit,
        digitalAccessibleOnly: true,
        filter: "contentClasses%3Ajp2"
      }),
    )
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (jsonResponse.page && jsonResponse.page.totalElements) {
          dispatch({
            type: 'SEARCH_SUCCESS',
            payload: jsonResponse._embedded.items,
            totalElements: jsonResponse.page.totalElements,
            page: page,
          })
        } else {
          dispatch({
            type: 'SEARCH_FAILURE',
            error: jsonResponse.Error,
          })
        }
      })
  }

  const search = (searchValue) => {
    // setSearchParameter(searchValue)

    dispatch({
      type: 'SEARCH_REQUEST',
      searchParameter: searchValue,
    })

    fetch(
      IMPORT_API_URL +
      new URLSearchParams({
        q: searchValue,
        page: 0,
        size: state.limit,
        digitalAccessibleOnly: true,
        filter: "contentClasses%3Ajp2"
      }),
    )
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (jsonResponse.page && jsonResponse.page.totalElements > 0) {
          dispatch({
            type: 'SEARCH_SUCCESS',
            payload: jsonResponse._embedded.items,
            totalElements: jsonResponse.page.totalElements,
            page: 0,
          })
        } else {
          dispatch({
            type: 'SEARCH_FAILURE',
            error: jsonResponse.Error,
            payload: [],
            totalElements: jsonResponse.page.totalElements,
          })
        }
      })
  }

  const { searchParameter, items, totalElements, page, limit, errorMessage, loading } = state

  return (
    <Container width={5}>
      <Box padding={4} marginTop={5}>
        <form>
          <Flex>
            <Search search={search} />
          </Flex>
        </form>
        <Box marginY={3}>
          {!loading && <Text flex={1} size={1}>{totalElements} result found</Text>}
        </Box>

        <Box marginBottom={3}>
          {!loading && totalElements != 0 &&
            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              forcePage={page}
              pageCount={totalElements / limit}
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
          }
        </Box>

        {loading && !errorMessage ? (
          <Flex style={{ width: "100%" }} align="center" justify="center">
            <Spinner size={2} />
          </Flex>
        ) : errorMessage ? (
          <SanityCard
            padding={[3, 3, 4]}
            radius={2}
            shadow={1}
            tone="critical"
          >
            <Text size={[2, 2, 3]}>
              {errorMessage}
            </Text>
          </SanityCard>
        ) : (
          <Grid columns={[2, 3, 3, 4]} gap={[2, 3, 3, 3]}>
            {items.map((item) => (
              <Card key={item.id} item={item} searchValue={searchParameter} onClick={chooseItem} />
            ))}
          </Grid>
        )}

        <Box marginY={3}>
          {!loading && totalElements != 0 &&
            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              forcePage={page}
              pageCount={totalElements / limit}
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
          }
        </Box>
      </Box>
    </Container>
  )
}

export default SearchNB