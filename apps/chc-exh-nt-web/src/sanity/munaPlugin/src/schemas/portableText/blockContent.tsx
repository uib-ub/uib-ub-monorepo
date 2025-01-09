import { FaPaperclip } from 'react-icons/fa'
import { defineType } from 'sanity'
/* 
import ExternalLinkRenderer from '../../previews/ExternalLinkRenderer'
import FootnoteRenderer from '../../previews/FootnoteRenderer'
*/

const HighlightIcon = () => <span style={{ fontWeight: 'bold' }}>H</span>
const HighlightRender = (props: any) => <span style={{ backgroundColor: 'yellow' }}>{props.children}</span>
//const footnoteIcon = () => <span style={{ fontWeight: 'bold' }}>F</span>

export default defineType({
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
            icon: HighlightIcon,
            component: HighlightRender,
          },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'External link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: Rule => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
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
                  { type: 'HumanMadeObject' },
                  { type: 'Collection' },
                  { type: 'Event' },
                  { type: 'Material' },
                ],
              },
            ],
          },
          /* {
            name: 'footnote',
            type: 'object',
            title: 'Footnote',
            blockEditor: {
              icon: footnoteIcon,
              render: FootnoteRenderer
            },
            fields: [
              {
                name: 'text',
                type: 'array',
                of: [{ type: 'block' }]
              }
            ]
          } */
        ],
      },
    },
    {
      type: 'reference',
      title: 'Insert internal object',
      to: [
        { type: 'Actor' },
        { type: 'HumanMadeObject' },
        { type: 'Collection' },
        { type: 'Event' },
        { type: 'Place' },
      ],
    },
    { type: 'BigTextBlock' },
    { type: 'ObjectBlock' },
    { type: 'Set' },
    { type: 'ObjectCompareBlock' },
    { type: 'VideoBlock' },
    { type: 'EventBlock' },
    { type: 'QuoteBlock' },
    { type: 'TableBlock' },
    { type: 'TwoColumnBlock' },
    { type: 'IframeBlock' },
  ],
})
