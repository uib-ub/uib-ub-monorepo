import React from 'react'
import { MultiList, ToggleButton } from '@appbaseio/reactivesearch'
import { Box, Card, Inline, Stack } from '@sanity/ui'

const AllFilters = () => (
  <Box paddingRight={4}>
    <Stack space={3}>
      <Inline space={2} padding={3}>
        <ToggleButton
          componentId="digitized"
          dataField="isDigitized"
          data={[{ label: 'Only digitized', value: 'Digitalisert' }]}
          title=""
          defaultValue={['Digitalisert']}
          multiSelect
          showFilter
          filterLabel="Digitized"
          URLParams={false}
          style={{ padding: 1 }}
        />
        <ToggleButton
          componentId="zoom"
          dataField="hasZoom"
          data={[{ label: 'With zoom', value: 'Med DeepZoom' }]}
          defaultValue={['Med DeepZoom']}
          title=""
          showFilter
          filterLabel="Digitized"
          URLParams={false}
          style={{ padding: 1 }}
        />
      </Inline>
    </Stack>
    <Card padding={[2, 3]} marginY={[2, 3]}>
      <MultiList
        dataField="type.exact"
        title="Types"
        componentId="types"
        queryFormat="or"
        react={{
          and: ['digitized', 'zoom'],
        }}
      />
    </Card>
    <Card padding={[2, 3]} marginY={[2, 3]}>
      <MultiList
        dataField="maker.exact"
        showSearch={false}
        title="Makers"
        componentId="makers"
        queryFormat="or"
        react={{
          and: ['search', 'digitized', 'zoom', 'types', 'makers'],
        }}
      />
    </Card>
  </Box>
)

const Filters = () => {
  // eslint-disable-next-line no-unused-vars
  // const [isVisible, setIsVisible] = useState(true)

  /* const handleMobileView = () => {
    setIsVisible(!isVisible)
  } */

  return (
    <div>
      {/* <button
        type='button'
        onClick={handleMobileView}
        className={buttonStyles}
      >
        {`Show ${isVisible ? 'Results' : 'Filters'}`}
      </button> */}
      {/* <div className={filterWrapper(isVisible)}> */}
      <div>
        <AllFilters />
      </div>
    </div>
  )
}

export default Filters
