import { label, note } from "./props";
export default {
  name: "scope",
  type: "document",
  liveEdit: "true",
  fields: [
    label,
    note,
    {
      name: "isPartOf",
      type: "reference",
      to: { type: "scope" },
      options: { filter: "isPartOf == undefined" },
    },
  ],
};
