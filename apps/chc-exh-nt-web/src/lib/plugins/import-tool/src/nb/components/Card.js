/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import DateBadge from '../../shared/components/DateBadge'
import { Card as SanityCard, Box, Button, Heading, Text, Badge, Stack, Inline } from '@sanity/ui'
import { RiDownloadLine } from 'react-icons/ri'
import License from './License'

const Card = ({ item, searchValue, onClick }) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isImported, setIsImported] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('Import')

  const onChooseItem = async (item) => {
    console.log(item)
    setIsFetching(true)
    setButtonLabel('...importing')
    const importStatus = await onClick(item)

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
    <SanityCard
      style={{ display: "flex", flexDirection: "column" }}
      key={item.id}
      padding={[2, 2, 3]}
      radius={2}
      shadow={1}
    >
      <Box>
        <img
          style={{ width: "100%", height: "250px", objectFit: "cover" }}
          src={
            item && item._links && item._links.thumbnail_large
              ? item._links.thumbnail_large.href
              : 'data:image/png;base64,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'
          }
          alt=''
        />
      </Box>
      <Box style={{ flexGrow: "1" }} marginY={3}>
        <Heading size="1">
          {item.metadata.title}
        </Heading>

        <Stack paddingY={2} space={3}>
          <Inline space={2}>
            {item.metadata.mediaTypes && item.metadata.mediaTypes.map((type) => (
              <Badge tone="primary" key={type}>{type}</Badge>
            ))}
          </Inline>
        </Stack>

        {item.metadata.creators && (
          <Stack paddingY={2} space={3}>
            <Inline space={2}>
              {item.metadata.creators.map((creator, index) => <Text key={index} mode="outline">{creator}</Text>)}
            </Inline>
          </Stack>
        )}

        {(item.metadata.dateCreated ?? item.metadata.originInfo?.issued) && (
          <Box marginTop={2}>
            <DateBadge date={item.metadata.dateCreated ?? item.metadata.originInfo?.issued} />
          </Box>
        )}

      </Box>

      <Box marginY={2} style={{ marginTop: "auto" }} >
        <License license={item.accessInfo.license} />
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
            onClick={() => onChooseItem(item)}
            tone='positive'
          />
          <a
            href={`https://www.nb.no/items/${item.id}?searchText=${searchValue}`}
            target="_blank" rel="noopener noreferrer"
          >
            View at nb.no
          </a>
        </Inline>
      </Stack>
    </SanityCard>
  )
}

export default Card