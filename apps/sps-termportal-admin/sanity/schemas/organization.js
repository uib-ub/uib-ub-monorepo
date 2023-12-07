import { label, note } from "./props";

export default {
  name: "organization",
  type: "document",
  liveEdit: "true",
  fields: [label, { name: "orgnr", type: "string" }, note],
  preview: {
    select: { title: "label" },
  },
};
