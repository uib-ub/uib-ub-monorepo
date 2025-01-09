import { defineType } from 'sanity'
import { coalesceLabel } from "../../../helpers"
import { labelSingleton } from '../../properties/datatype'
import { image } from '../../properties/object'

export default defineType({
  name: 'ObjectBlockItem',
  title: 'Object block item',
  type: 'object',
  initialValue: {
    view: 'single'
  },
  fields: [
    {
      name: 'disabled',
      title: 'Avslått?',
      type: 'boolean',
    },
    {
      name: 'view',
      title: 'Visningsvalg',
      description: 'Velg enkeltside-visning eller oppslagsvisning (oppslag bare mulig med Mirador).',
      type: 'string',
      options: {
        list: [
          { title: 'Book', value: 'book' },
          { title: 'Single', value: 'single' },
        ],
      },
    },
    {
      ...labelSingleton,
      validation: undefined,
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
    },
    {
      name: 'internalRef',
      title: 'Object in the studio',
      type: 'reference',
      to: [{ type: 'HumanMadeObject' }],
      hidden: ({ value, parent }) => !value && parent?.image || parent?.manifestUrl,
    },
    {
      ...image,
      hidden: ({ value, parent }) => !value && parent?.manifestUrl,
    },
    {
      name: 'manifestUrl',
      title: 'Manifest adresse',
      type: 'url',
      hidden: ({ value, parent }) => !value && parent?.image || parent?.internalRef,
    },
    {
      name: 'canvasUrl',
      title: 'Canvas URL',
      type: 'url',
      hidden: ({ parent, value }) => !value && parent?.internalRef || parent?.image
    },
    {
      name: 'source',
      title: 'Kilde',
      description: 'Legg til kilde eller kreditering',
      type: 'simpleBlockContent',
    },
  ],
  preview: {
    select: {
      title: 'label',
      internalManifest: 'internalRef.label',
      manifestUrl: 'manifestUrl',
      object: 'internalRef.image',
      illustration: 'image.asset',
      source: 'source',
    },
    prepare({ title, internalManifest, manifestUrl, object, illustration, source }) {
      const objectLabel = coalesceLabel(internalManifest)
      const hasIllustration = illustration ? null : 'Illustration'
      const sourceBlock = (source || []).find((block: any) => block._type === 'block')

      const getSubtitle = objectLabel || manifestUrl || (sourceBlock
        ? sourceBlock.children
          .filter((child: any) => child._type === 'span')
          .map((span: any) => span.text)
          .join('') : null)

      return {
        title: (title || objectLabel || hasIllustration) ?? 'No label',
        subtitle: getSubtitle,
        media: object ?? illustration,
      }
    },
  },
})
