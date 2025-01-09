"use client";
/**
 * This config is used to set up Sanity Studio that's mounted on the `app/(sanity)/studio/[[...tool]]/page.tsx` route
 */
import { codeInput } from "@sanity/code-input";
import { colorInput } from "@sanity/color-input";
import { documentInternationalization } from '@sanity/document-internationalization';
import { languageFilter } from '@sanity/language-filter';
import { table } from '@sanity/table';
import { visionTool } from "@sanity/vision";
import { SchemaTypeDefinition, defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { defaultDocumentNode, structure } from '@/src/sanity/deskStructure';
import { apiVersion, dataset, projectId, studioUrl } from "@/src/sanity/lib/api";
import { resolveHref } from "@/src/sanity/lib/utils";
import { schemaTypes } from '@/src/sanity/munaPlugin/src';
import SiteSettings from '@/src/sanity/munaPlugin/src/schemas/classes/persistent/information/site/SiteSettings';

const homeLocation = {
  title: "Home",
  href: "/",
} satisfies DocumentLocation;

export default defineConfig({
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    types: schemaTypes as SchemaTypeDefinition[]
  },
  document: {
    // Hide 'Settings' from new document options
    // https://user-images.githubusercontent.com/81981/195728798-e0c6cf7e-d442-4e58-af3a-8cd99d7fcc28.png
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => templateItem.templateId !== SiteSettings.name
        )
      }

      return prev
    },
  },
  plugins: [
    structureTool({
      structure,
      defaultDocumentNode,
    }),
    documentInternationalization({
      // Required:
      supportedLanguages: [
        { id: 'no', title: 'Norwegian' },
        { id: 'en', title: 'English' },
        { id: 'ar', title: 'Arabic' },
      ],
      schemaTypes: ['Page', 'LinguisticDocument'],
      // Optional:
      weakReferences: false, // default false
      languageField: 'language', // default "language"
    }),
    languageFilter({
      supportedLanguages: [
        { id: 'no', title: 'Norwegian' },
        { id: 'en', title: 'English' },
        { id: 'ar', title: 'Arabic' },
      ],
      // Select Norwegian (Bokmål) by default
      defaultLanguages: ['no'],
      // Only show language filter for document type `page` (schemaType.name)
      //documentTypes: undefined,
      filterField: (enclosingType, field, selectedLanguageIds) =>
        !enclosingType.name.startsWith('Localized') || selectedLanguageIds.includes(field.name),
    }),
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/posts/:slug",
            filter: `_type == "post" && slug.current == $slug`,
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: "This document is used on all pages",
            tone: "caution",
          }),
          post: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled",
                  href: resolveHref("post", doc?.slug)!,
                },
                homeLocation,
              ],
            }),
          }),
        },
      },
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
    colorInput(),
    table(),
  ].filter(Boolean),
});
