import { label, note, responsibleStaff } from "./props";
export default {
  name: "scope",
  type: "document",
  liveEdit: true,
  fields: [
    label,
    note,
    {
      name: "isPartOf",
      type: "reference",
      to: { type: "scope" },
      options: { filter: "isPartOf == undefined" },
    },
    { name: "responsiblePeople", type: "array", of: [responsibleStaff] },
  ],
};
