import { TypeOf, z } from 'zod';

export const withDevDefault = <T extends z.ZodTypeAny>(
  schema: T,
  val: TypeOf<T>
) => (process.env["NODE_ENV"] !== "production" ? schema.default(val) : schema);

const schema = z.object({
  API_URL: withDevDefault(z.string().url(), 'http://localhost'),
  PORT: withDevDefault(z.string(), '3009').transform(Number),
  ES_HOST: z.string().url(),
  ES_APIKEY: z.string(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4)
  );
  throw new Error("Invalid environment variables");
  //process.exit(1);
}

export const env = parsed.data;