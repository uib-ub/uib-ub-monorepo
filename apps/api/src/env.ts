import { TypeOf, z } from 'zod';
import { version } from '../package.json';

export const withDevDefault = <T extends z.ZodTypeAny>(
  schema: T,
  val: TypeOf<T>
) => (process.env["NODE_ENV"] !== "production" ? schema.default(val) : schema);

const schema = z.object({
  API_BASE_URL: withDevDefault(z.url(), 'http://localhost:3009'),
  API_DEVELOPMENT_PORT: withDevDefault(z.string(), '3009').transform(Number),
  API_BASE_PATH: z.string().optional(),
  API_SEARCH_HOST: z.url(),
  API_SEARCH_API_KEY: z.string(),
  API_OBSERVE_HOST: z.url(),
  API_OBSERVE_API_KEY: z.string(),
});

const parsed = schema.safeParse(process.env);

if (parsed.success === false) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(z.treeifyError(parsed.error), null, 4)
  );
  throw new Error("Invalid environment variables");
}

const API_DOCUMENTATION_URL = "https://docs-ub.vercel.app";
export const env = {
  ...parsed.data,
  API_VERSION: `${version}-beta`,
  API_DOCUMENTATION_URL
};