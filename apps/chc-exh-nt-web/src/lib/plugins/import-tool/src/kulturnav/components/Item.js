import React from 'react'
import { useStore } from "./SearchProvider"
import {Box, Card as SanityCard, Container, Grid, Flex, Text, Spinner} from '@sanity/ui'
import Card from './Card'

export const Items = () => {
  const {state} = useStore()
  return (
    <>
    {state.loading && !state.errorMessage ? (
      <Flex style={{width: "100%"}} align="center" justify="center">
        <Spinner size={2}/>
      </Flex>
    ) : state.errorMessage ? (
      <SanityCard
        padding={[3, 3, 4]}
        radius={2}
        shadow={1}
        tone="critical"
      >
        <Text size={[2, 2, 3]}>
          {state.errorMessage}
        </Text>
      </SanityCard>
    ) : (
      <Grid columns={[2, 3, 3, 4]} gap={[2, 3, 3, 3]}>
        {state.items.map((item) => (
          <Card key={item.uuid} item={item} />
        ))}
      </Grid>
    )}
    </>
  )
}
