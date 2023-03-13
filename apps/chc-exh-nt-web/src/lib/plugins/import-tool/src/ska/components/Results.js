import React from 'react'
import { ReactiveList } from '@appbaseio/reactivesearch'
import Card from './Card'
import Search from './Search'
import {
  Box,
  Grid,
} from '@sanity/ui'

const Results = () => {
  return (
    <Box padding={[4]} style={{ borderLeft: 'solid #ccc 1px' }}>
      <Search />
      <ReactiveList
        componentId="results"
        pagination
        paginationAt="both"
        react={{
          and: ['search', 'digitized', 'zoom', 'types', 'makers'],
        }}
        dataField="identifier"
        size={9}
      >
        {({ loading, data, error }) => {
          if (loading) {
            return <p>Loading...</p>
          }
          if (error) {
            return <p>Something Went Wrong!</p>
          }
          if (data.length) {
            return (
              <Grid columns={[1, 1, 2, 3, 4]} gap={[1, 1, 2, 3]}>
                {data.map((item) => (
                  <Card item={item} />
                ))}
              </Grid>
            )
          } else {
            return <p>No Results Found</p>
          }
        }}
      </ReactiveList>
    </Box>
  )
}

export default Results
