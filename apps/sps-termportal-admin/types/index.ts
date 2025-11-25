import type { AppConfig } from "nuxt/schema";

export {};

declare global {
  type HeadingLevelWithDefaultOptions = keyof AppConfig["ui"]["headingTextClassOptions"];

  type SparqlBindingKey = { type: string; value: string };
  type SparqlBindingKeyDt = { type: string; datatype: string; value: string };

}
