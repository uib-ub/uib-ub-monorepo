/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dashboardTool } from "@sanity/dashboard";
// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId, previewSecretId } from '@/sanity/env'

import { timespanInput } from '@seidhr/sanity-plugin-timespan-input'
import { codeInput } from '@sanity/code-input'
import { table } from '@sanity/table';
import { schema } from '@/sanity/schema'
import { deskStructure } from '@/sanity/structure'
import { dashboardConfig } from '@/sanity/dashboard'
import { PREVIEWABLE_DOCUMENT_TYPES, PREVIEWABLE_DOCUMENT_TYPES_REQUIRING_SLUGS } from '@/sanity/schemas';
import { defineUrlResolver, PREVIEW_BASE_URL } from '@/sanity/lib/utils';
import { templates } from '@/sanity/structure/templates';
import { defaultDocumentNode } from '@/sanity/structure/defaultDocumentNode';

export const urlResolver = defineUrlResolver({
  base: PREVIEW_BASE_URL,
  requiresSlug: PREVIEWABLE_DOCUMENT_TYPES_REQUIRING_SLUGS,
})

export default defineConfig({
  title: 'UB-dashboard',
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schema' folder
  schema: {
    types: schema.types,
    // TEST: Add a custom template to the Studio
    templates: (prev) => [
      ...prev,
      ...templates
    ],
  },
  plugins: [
    dashboardTool(dashboardConfig),
    structureTool({
      structure: deskStructure,
      // `defaultDocumentNode` is responsible for adding a “Preview” tab to the document pane
      // You can add any React component to `S.view.component` and it will be rendered in the pane
      // and have access to content in the form in real-time.
      // It's part of the Studio's “Structure Builder API” and is documented here:
      // https://www.sanity.io/docs/structure-builder-reference
      defaultDocumentNode,
      /* defaultDocumentNode: (S: any, { schemaType }: any) => {
        if ((PREVIEWABLE_DOCUMENT_TYPES as string[]).includes(schemaType)) {
          return S.document().views([
            // Default form view
            S.view.form(),
            // Preview
            S.view.component(Iframe).options(iframeOptions).title('Preview'),
            S.view.component(ReferencedBy).title('Lenker til dokumentet')
          ])
        }
        return S.document().views([
          // Default form view
          S.view.form(),
          S.view.component(ReferencedBy).title('Lenker til dokumentet')
        ])
      }, */
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    timespanInput(),
    codeInput(),
    table(),
  ],
})

