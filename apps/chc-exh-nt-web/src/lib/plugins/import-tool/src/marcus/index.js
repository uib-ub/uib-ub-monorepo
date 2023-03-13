import React from 'react'
import { ReactiveBase } from '@appbaseio/reactivesearch'
import Filters from './components/Filters'
import Results from './components/Results'
//import Search from './components/Search'
import { Box, Flex } from '@sanity/ui'

export default function SearchMarcus() {
  const marcus = 'https://jambo.uib.no/elasticsearch'

  return (
    <ReactiveBase
      url={marcus}
      app="marcus-prod"
      transformRequest={props => ({
        ...props,
        url: process.env.NODE_ENV === 'production' ? props.url.replace('_msearch', '_search') : props.url
      })}
    >
      <Box marginTop={5}>
        {/* <Search /> */}
        <Flex marginTop="5" paddingX={2} style={{ borderTop: '1px solid #ccc' }}>
          <Filters />
          <Results />
        </Flex>
      </Box>
    </ReactiveBase>
  )
}
