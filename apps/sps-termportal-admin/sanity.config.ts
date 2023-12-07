import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { timespanInput } from "@seidhr/sanity-plugin-timespan-input";
import { schemaTypes } from "./sanity/schemas";
import { deskStructure } from "./sanity/deskStructure";

export const sanityConfig = defineConfig({
  plugins: [
    timespanInput(),
    deskTool({
      structure: deskStructure,
    }),
  ],
  name: "default",
  title: "Studio",
  projectId: "k38biek5",
  dataset: "production",
  basePath: "/studio", // embedded in route
  schema: {
    types: schemaTypes,
  },
});
