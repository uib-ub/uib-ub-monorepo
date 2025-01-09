import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/src/sanity/lib/client";
import { token } from "@/src/sanity/lib/token";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
