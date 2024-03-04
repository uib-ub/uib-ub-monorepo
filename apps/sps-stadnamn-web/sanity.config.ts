import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {type PluginOptions} from 'sanity'



const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID! || 'k5hdv6d6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET! || 'production'

import {schemaTypes} from './src/config/sanity-schema'

export default defineConfig({
  basePath: '/admin',
  projectId,
  plugins: [
    structureTool()
  ] as PluginOptions['plugins'],
  schema: {
    types: schemaTypes,
  },
  dataset})