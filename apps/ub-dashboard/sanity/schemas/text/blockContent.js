import React from 'react'
import { FaPaperclip } from 'react-icons/fa'
import ExternalLinkRenderer from './ExternalLinkRenderer'
import FootnoteRenderer from './FootnoteRenderer'

const highlightIcon = () => <span style={{ fontWeight: 'bold' }}>H</span>
const highlightRender = (props) => <span style={{ backgroundColor: 'yellow' }}>{props.children}</span>
const footnoteIcon = () => <span style={{ fontWeight: 'bold' }}>F</span>

export const blockContent = {
  name: 'blockContent',
  title: 'Excerpt',
  type: 'array',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
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
            icon: highlightIcon,
            component: highlightRender,
          },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'External link',
            component: ExternalLinkRenderer,
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                description: 'Read https://css-tricks.com/use-target_blank/',
                type: 'boolean',
                initialValue: true
              },
            ],
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Internal link',
            icon: FaPaperclip,
            fields: [
              {
                name: 'reference',
                type: 'reference',
                title: 'Reference',
                to: [
                  { type: 'Actor' },
                  { type: 'Group' },
                  { type: 'Software' },
                  { type: 'Service' },
                  { type: 'Event' },
                  { type: 'Place' },
                  // other types you may want to link to
                ],
              },
            ],
          },
          {
            name: 'footnote',
            type: 'object',
            title: 'Footnote',
            icon: footnoteIcon,
            component: FootnoteRenderer,
            fields: [
              {
                name: 'text',
                type: 'array',
                of: [{ type: 'block' }]
              }
            ]
          }
        ],
      },
    },
    {
      type: 'reference',
      title: 'Insert internal object',
      to: [
        { type: 'Actor' },
        { type: 'Group' },
        { type: 'Software' },
        { type: 'Service' },
        { type: 'Event' },
        { type: 'Place' },
      ],
    },
    { type: 'IllustrationWithCaption' },
    { type: 'PageHeader' },
    { type: 'SingleLevelChart' },
    { type: 'Table' },
    { type: 'Video' },
    { type: 'Iframe' },
  ],
  options: {
    semanticSanity: {
      exclude: true
    }
  },
}
