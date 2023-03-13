import React from 'react'
import { DataSearch, SelectedFilters } from '@appbaseio/reactivesearch'
import { Box } from '@sanity/ui'
import styled from 'styled-components'

const navbarStyles = styled.div`
  padding: 0 25px;
  background: #08c;
  height: 70px;
  display: grid;
  grid-template-columns: auto;
  align-items: center;
  position: sticky;
  top: 0px;
  z-index: 20;
  grid-gap: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  input {
    font-size: 0.8em;
    padding: 10px 20px 10px 40px;
    width: 100%;
    outline: none;
    border: 0;
  }
`

const Navbar = () => {
  return (
    <Box className={navbarStyles}>
      <DataSearch
        dataField={['identifier', 'title', 'description', 'label', 'prefLabel', 'subject', 'maker', 'spatial']}
        fieldWeights={[2, 1, 2, 2]}
        componentId="search"
        autosuggest={false}
        placeholder="Search ..."
      />
      <Box marginTop={3}>
        <SelectedFilters />
      </Box>
    </Box>
  )
}

export default Navbar
