import React, { useState } from 'react'
import {
  Box,
  Card as SanityCard,
  Heading,
  Text,
  Badge,
  Button,
  Inline,
  Stack
} from '@sanity/ui'
import { RiDownloadLine } from 'react-icons/ri'
import { chooseItem } from '../apis'
import { coalesceLabel } from '../../helpers'
import { useImportType } from './SearchProvider'

const Card = ({ item }) => {
  const { state: { importTo }
  } = useImportType()

  const [isFetching, setIsFetching] = useState(false)
  const [isImported, setIsImported] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('Import')

  const onChooseItem = async (item, to) => {
    setIsFetching(true)
    setButtonLabel('...importing')
    const importStatus = await chooseItem(item, to)

    if (!importStatus.success) {
      setIsFetching(false)
      setButtonLabel('Import failed!')
      return
    }

    setIsFetching(false)
    setIsImported(true)
    setButtonLabel('Imported!')
  }

  const { uuid, entityType, caption, properties } = item

  return (
    <SanityCard style={{ display: "flex", flexDirection: "column" }} key={uuid} padding={[2, 2, 3]} radius={2} shadow={1}>
      {/* NOT EASILY AVAILABLE
      <Box>
        <img style={{width: "100%"}} src={hasThumbnail} />
      </Box> */}
      <Box style={{ flexGrow: "1" }} marginY={3}>
        <Heading size="1">
          {caption.no || caption.sv || caption.en || 'Manglende caption?'}
        </Heading>
        <Stack paddingY={2} space={3}>
          <Inline space={2}>
            <Badge tone="primary">{entityType}</Badge>
          </Inline>

          <Text muted size={[1, 1, 1]}>
            <small>Datasett:</small><br />
            {coalesceLabel(properties['entity.dataset'][0].displayValue, 'no')}
          </Text>

        </Stack>
      </Box>
      <Stack style={{ borderTop: "1px dotted gray", marginTop: "auto" }} paddingTop={2} space={3}>
        <Inline space={2}>
          <Button
            fontSize={[1, 1, 2]}
            padding={[1, 1, 2]}
            icon={RiDownloadLine}
            text={buttonLabel}
            mode={isImported ? 'ghost' : 'default'}
            disabled={isFetching}
            onClick={() => onChooseItem(item, importTo)}
            tone='positive'
          />
          <a href={`https://kulturnav.org/${uuid}`} target="_blank" rel="noopener noreferrer">Åpne i Kulturnav</a>
        </Inline>
      </Stack>
    </SanityCard>
  )
}

export default Card
