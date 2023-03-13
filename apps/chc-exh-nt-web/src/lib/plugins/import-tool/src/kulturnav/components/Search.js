import React, { useEffect, useState } from 'react'
import { Box, Card, Checkbox, Flex, TextInput, Text, Button, Inline, Radio, Select, Stack } from '@sanity/ui'
import { useStore } from './SearchProvider'

const Search = () => {
  const [searchValue, setSearchValue] = useState('')
  const { state, dispatch } = useStore()
  const { checked, setChecked } = useState(false)

  useEffect(() => {
    fetch(
      `${state.apiURL}entityType:${state.searchType}${state.filter},compoundName:${state.searchParameter}/${state.page}/${state.max}`
    )
      .then((response) => response.json())
      .then((jsonResponse) => {
        dispatch({
          type: 'SEARCH_SUCCESS',
          payload: jsonResponse,
          totalElements: jsonResponse.length,
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* const handlePageClick = (data) => {
    let selected = data.selected
    let page = selected

    dispatch({
      type: 'SEARCH_REQUEST',
      searchParameter: state.searchParameter,
    })

    fetch(
      state.apiURL + 'entityType:${state.searchType}${state.filter},compoundName:' + state.searchParameter
        ? state.searchParameter
        : '' + new URLSearchParams({}),
    )
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (jsonResponse && jsonResponse.length) {
          dispatch({
            type: 'SEARCH_SUCCESS',
            payload: jsonResponse,
            totalElements: jsonResponse.length,
            page: page,
          })
        } else {
          dispatch({
            type: 'SEARCH_FAILURE',
            error: jsonResponse.Error,
          })
        }
      })
  } */

  const search = (searchValue) => {
    dispatch({
      type: 'SEARCH_REQUEST',
      searchParameter: searchValue,
    })

    fetch(
      `${state.apiURL}entityType:${state.searchType}${state.filter},compoundName:${searchValue}${state.fromCollection ? ',entity.dataset:' + state.fromCollection : ''}/0/${state.max}`
    )
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (jsonResponse && jsonResponse.length > 0) {
          dispatch({
            type: 'SEARCH_SUCCESS',
            payload: jsonResponse,
            totalElements: jsonResponse.length,
            page: 0,
          })
        } else {
          dispatch({
            type: 'SEARCH_FAILURE',
            payload: jsonResponse,
            totalElements: 0,
            error: jsonResponse.Error,
          })
        }
      })
  }

  const setSearchType = (e) => {
    dispatch({
      type: 'SET_TYPE_SEARCH',
      searchType: e,
      importTo: e
    })
  }

  const setImportType = (e) => {
    dispatch({
      type: 'SET_IMPORT_TYPE',
      importTo: e
    })
  }

  const setFromCollection = (e) => {
    dispatch({
      type: 'SET_FROM_COLLECTION',
      fromCollection: e
    })
  }

  const handleSearchInputChanges = (e) => {
    setSearchValue(e.target.value)
  }

  const handleClear = () => {
    setSearchValue('')
  }

  const callSearchFunction = (e) => {
    e.preventDefault()
    search(searchValue)
  }

  const callSetSearchTypeFunction = (e) => {
    setSearchType(e.target.value)
  }

  const callSetImportTypeFunction = (e) => {
    setImportType(e.target.value)
  }

  const callSetFromCollectionFunction = (e) => {
    setFromCollection(e)
  }

  const { totalElements } = state

  return (
    <form>
      <Flex>
        <Stack>
          <Select
            fontSize={[2, 2, 2, 3]}
            padding={[2, 2, 3]}
            space={[2, 2, 3]}
            onChange={e => callSetSearchTypeFunction(e)}
          >
            <option value="Concept">Emneord</option>
            <option value="Agent">Aktører</option>
          </Select>
        </Stack>
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
      </Flex>

      <Card padding={[2, 2, 3]} radius={2} shadow={1} marginY={[2, 2, 3]}>
        <Stack space={3}>
          {state.searchType === 'Concept' && (
            <Inline space={3}>
              Importér som:
              <Radio
                checked={state.importTo === 'Concept'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="Concept"
              /> Emneord
              <Radio
                checked={state.importTo === 'ActorType'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="ActorType"
              /> Aktørtype
              <Radio
                checked={state.importTo === 'Role'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="Role"
              /> Rolle
              <Radio
                checked={state.importTo === 'ObjectType'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="ObjectType"
              /> Objekttype
              <Radio
                checked={state.importTo === 'Material'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="Material"
              /> Materiale
              <Radio
                checked={state.importTo === 'Technique'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="Technique"
              /> Teknikk
              <Radio
                checked={state.importTo === 'TextType'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="TextType"
              /> Teksttype
              <Radio
                checked={state.importTo === 'IdentifierType'}
                name="concept"
                onChange={e => callSetImportTypeFunction(e)}
                value="IdentifierType"
              /> Identifikatortype
              <Flex align="center">
                <Checkbox id="fromCollection" style={{ display: 'block' }} checked={checked} onChange={e => callSetFromCollectionFunction(e)} />
                <Box flex={1} paddingLeft={3}>
                  <Text>
                    <label htmlFor="fromCollection">UB KN-dataset</label>
                  </Text>
                </Box>
              </Flex>
            </Inline>
          )}
          {!state.loading && (
            <Box>
              <Text flex={1} size={1}>{totalElements} result found</Text>
            </Box>
          )}
        </Stack>
      </Card>
    </form>
  )
}

export default Search
