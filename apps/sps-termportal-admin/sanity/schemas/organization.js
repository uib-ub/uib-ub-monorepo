import { label, note } from "./props";

export default {
  name: "organization",
  type: "document",
  title: "Organisasjon",
  liveEdit: "true",
  fields: [label, { name: "orgnr", type: "string" }, note],
  preview: {
    select: { title: "label" },
  },
};
