import { TypeOf, z } from 'zod';

export const withDevDefault = <T extends z.ZodTypeAny>(
  schema: T,
  val: TypeOf<T>
) => (process.env["NODE_ENV"] !== "production" ? schema.default(val) : schema);

const schema = z.object({
  PROD_URL: z.string().url(),
  API_URL: withDevDefault(z.string().url(), 'http://localhost'),
  PORT: withDevDefault(z.string(), '3009').transform(Number),
  ES_HOST: z.string().url(),
  ES_APIKEY: z.string(),
  API_ES_WRITE_TOKEN: z.string(),
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