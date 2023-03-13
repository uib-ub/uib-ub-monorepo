/* eslint-disable @next/next/no-img-element */
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

const Card = ({ item }) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isImported, setIsImported] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('Import')

  const onChooseItem = async (item) => {
    setIsFetching(true)
    setButtonLabel('...importing')
    const importStatus = await chooseItem(item)

    if (!importStatus.success) {
      setIsFetching(false)
      setButtonLabel('Import failed!')
      console.log(importStatus.body)
      return
    }

    setIsFetching(false)
    setIsImported(true)
    setButtonLabel('Imported!')
  }

  return (
    <SanityCard style={{ display: "flex", flexDirection: "column" }} key={item.id} padding={[2, 2, 3]} radius={2} shadow={1}>
      <Box>
        <img style={{ width: "100%" }} src={item.hasThumbnail} alt="" />
      </Box>
      <Box style={{ flexGrow: "1" }} marginY={3}>
        <Heading size="1">
          {item.label || item.preferredLabel || item.title || item.identifier}
        </Heading>
        <Stack paddingY={2} space={3}>
          <Inline space={2}>
            <Badge tone="primary">{item.type}</Badge>
          </Inline>
          {item.description && (
            <Text muted size={[1, 1, 2]}>
              {item.description.slice(0, 250)}
            </Text>
          )}
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
            disabled={isFetching || item.type === "Emne"}
            onClick={() => onChooseItem(item.uri)}
            tone='positive'
          />
          <a href={item._id} target="_blank" rel="noopener noreferrer">Åpne i SKA-katalog</a>
        </Inline>
      </Stack>
    </SanityCard>
  )
}

export default Card
