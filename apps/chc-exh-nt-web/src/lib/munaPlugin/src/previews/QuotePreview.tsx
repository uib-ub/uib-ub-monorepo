import React from 'react'
import {
  Box,
} from '@sanity/ui'

export const QuotePreview = ({ value: { content, credit } }: any) => {
  const text = content
    ? content.map((block: any) => block.children
      .filter((child: any) => child._type === 'span')
      .map((span: any, index: number) => (<p key={index}>{`"${span.text}"`}</p>)))
    : ''

  const textCredit = credit
    ? credit.map((block: any) => block.children
      .filter((child: any) => child._type === 'span')
      .map((span: any, index: number) => (<small key={index}>{span.text}</small>)))
    : ''

  return (
    <Box padding={[3, 3, 4, 4]}>
      {text &&
        <>{text}</>
      }
      {textCredit &&
        <>{textCredit}</>
      }
    </Box>
  )
}