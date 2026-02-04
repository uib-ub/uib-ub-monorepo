/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import {
  dashboardTool, projectUsersWidget,
  projectInfoWidget,
} from "@sanity/dashboard";
import { documentListWidget } from "sanity-plugin-dashboard-widget-document-list";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from '@/sanity/env'

import { timespanInput } from '@seidhr/sanity-plugin-timespan-input'
import { codeInput } from '@sanity/code-input'
import { table } from '@sanity/table';
import { schema } from '@/sanity/schema'
import { deskStructure } from '@/sanity/structure'
import { templates } from '@/sanity/structure/templates';
import { defaultDocumentNode } from '@/sanity/structure/defaultDocumentNode';


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
    dashboardTool({
      widgets: [
        documentListWidget({
          title: 'Recently edited',
          order: '_updatedAt desc',
          limit: 10,
          layout: { width: 'small' },
        }),
        projectUsersWidget({ layout: { width: 'medium' } }),
        projectInfoWidget(),
      ],
    }),
    structureTool({
      structure: deskStructure,
      // `defaultDocumentNode` is responsible for adding a “Preview” tab to the document pane
      // You can add any React component to `S.view.component` and it will be rendered in the pane
      // and have access to content in the form in real-time.
      // It's part of the Studio's “Structure Builder API” and is documented here:
      // https://www.sanity.io/docs/structure-builder-reference
      defaultDocumentNode,
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    timespanInput(),
    codeInput(),
    table(),
  ],
})

