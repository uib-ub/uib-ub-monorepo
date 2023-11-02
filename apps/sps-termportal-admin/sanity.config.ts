import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemas";

export const sanityConfig = defineConfig({
  plugins: [deskTool()],
  name: "default",
  title: "Studio",
  projectId: "k38biek5",
  dataset: "production",
  basePath: "/studio", // embedded in route
  schema: {
    types: schemaTypes,
  },
});
