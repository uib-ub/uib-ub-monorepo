import { label, note, tbstatus } from "./props";
import attribution from "./qualifiedPattern/attribution";

export default {
  name: "termbase",
  type: "document",
  liveEdit: "true",
  fields: [
    label,
    {
      name: "id",
      type: "string",
    },
    tbstatus,
    note,
    { name: "licenseNote", type: "text", rows: 2 },
    {
      name: "responsibleStaff",
      type: "reference",
      to: [{ type: "person" }],
    },
    {
      name: "contactPerson",
      type: "array",
      of: [
        {
          name: "person",
          type: "reference",
          to: [{ type: "person" }],
        },
      ],
    },
    { name: "qualifiedAtribution", type: "array", of: [attribution] },
  ],
  preview: {
    select: {
      title: "label",
      id: "id",
    },
  },
};
