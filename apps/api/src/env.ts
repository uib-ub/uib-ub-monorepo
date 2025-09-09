import { TypeOf, z } from 'zod';

export const withDevDefault = <T extends z.ZodTypeAny>(
  schema: T,
  val: TypeOf<T>
) => (process.env["NODE_ENV"] !== "production" ? schema.default(val) : schema);

const schema = z.object({
  PROD_URL: z.url(),
  API_URL: withDevDefault(z.url(), 'http://localhost'),
  PORT: withDevDefault(z.string(), '3009').transform(Number),
  API_VERSION: withDevDefault(z.string(), 'development'),
  ES_HOST: z.url(),
  ES_APIKEY: z.string(),
  API_ES_WRITE_TOKEN: z.string(),
  OBSERVE_ES_HOST: z.url(),
  OBSERVE_ES_APIKEY: z.string(),
});

const parsed = schema.safeParse(process.env);

if (parsed.success === false) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(z.treeifyError(parsed.error), null, 4)
  );
  throw new Error("Invalid environment variables");
}

const DOCUMENTATION_URL = "https://docs-ub.vercel.app";
export const env = {
  ...parsed.data,
  DOCUMENTATION_URL
};