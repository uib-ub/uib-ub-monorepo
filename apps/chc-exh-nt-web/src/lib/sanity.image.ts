import { config } from './sanity.config'
import sanityClient from '@sanity/client'

export const imageClient = sanityClient(config)
