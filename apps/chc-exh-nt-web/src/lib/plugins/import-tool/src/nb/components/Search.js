import React, { useState } from 'react'
import { Box, TextInput, Button, Inline } from '@sanity/ui'

const Search = (props) => {
  const [searchValue, setSearchValue] = useState('')

  const handleSearchInputChanges = (e) => {
    setSearchValue(e.target.value)
  }

  const handleClear = () => {
    setSearchValue('')
  }

  const callSearchFunction = (e) => {
    e.preventDefault()
    props.search(searchValue)
  }

  return (
    <>
      <Box flex={3}>
        <TextInput
          fontSize={[2, 2, 2, 3]}
          padding={[2, 2, 3]}
          type="text"
          onChange={handleSearchInputChanges}
          value={searchValue}
          isClearable
          onClear={() => handleClear('')}
        />
      </Box>
      <Box marginLeft={2}>
        <Button
          fontSize={[2, 2, 2, 3]}
          padding={[2, 2, 3]}
          onClick={callSearchFunction}
          mode="default"
          type="submit"
          text="Søk"
        />
      </Box>
    </>
  )
}

export default Search
