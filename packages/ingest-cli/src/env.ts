import { TypeOf, z } from 'zod';

export const withDevDefault = <T extends z.ZodTypeAny>(
  schema: T,
  val: TypeOf<T>
) => (process.env["NODE_ENV"] !== "production" ? schema.default(val) : schema);

const schema = z.object({
  API_BASE_URL: z.url(),
  API_DEVELOPMENT_PORT: withDevDefault(z.string(), '3009').transform(Number),
  API_SEARCH_HOST: z.url(),
  API_SEARCH_API_KEY: z.string(),
  API_SEARCH_WRITE_API_KEY: z.string(),
  API_OBSERVE_HOST: z.string().url(),
  API_OBSERVE_API_KEY: z.string(),
  SPARQL_CHC_ENDPOINT: z.url(),
});

const parsed = schema.safeParse(process.env);

if (parsed.success === false) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4)
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;