import React from 'react'
import { defineType } from 'sanity'

const HighlightIcon = () => <span style={{ fontWeight: 'bold' }}>H</span>
const HighlightRender = (props: any) => <span style={{ backgroundColor: 'yellow' }}>{props.children}</span>

export default defineType({
  name: 'reportText',
  type: 'array',
  title: 'Excerpt',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Numbered', value: 'number' },
        { title: 'Bulleted', value: 'bullet' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          {
            title: 'Highlight',
            value: 'highlight',
            icon: HighlightIcon,
            component: HighlightRender,
          },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'URL',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    },
    { type: 'DigitalObjectImage' },
    {
      type: 'reference',
      to: [
        { type: 'Actor' },
        { type: 'HumanMadeObject' },
        { type: 'Collection' },
        { type: 'Event' },
        { type: 'Place' },
        { type: 'Material' },
        { type: 'Measurement' },
      ],
    },
  ],
})
