import { config } from './sanity.config'
import { createClient } from '@sanity/client'

export const imageClient = createClient(config)
