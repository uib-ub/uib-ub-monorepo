export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig();
 // event.context.auth = runtimeConfig.apiKey;
});
