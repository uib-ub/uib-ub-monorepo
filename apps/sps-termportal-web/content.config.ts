import { defineCollection, defineContentConfig } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: "page",
      source: {
        repository: "https://github.com/uib-ub/terminologi-content",
        include: "web/**",
      },
    }),
  },
});
