import { definePlugin } from "sanity";
// import { ExternalAPIInput } from "./ExternalAPIInput";

interface MyPluginConfig {
  /* nothing here yet */
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-external-API-input'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin()],
 * })
 * ```
 */
export const externalAPIInput = definePlugin<MyPluginConfig | void>(
  (config = {}) => {
    // eslint-disable-next-line no-console
    console.log("hello from sanity-plugin-external-api-input");
    return {
      name: "sanity-plugin-external-api-input",
      form: {
        components: {
          // input: ExternalAPIInput,
          // preview: ExternalAPIPreview,
        },
      },
    };
  }
);
