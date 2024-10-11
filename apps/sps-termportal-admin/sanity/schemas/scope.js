import { label, note, responsibleStaff } from "./props";
export default {
  name: "scope",
  title: "Omfang",
  type: "document",
  liveEdit: true,
  fields: [
    label,
    note,
    {
      name: "isPartOf",
      title: "Er en del av",
      type: "reference",
      to: { type: "scope" },
      options: { filter: "isPartOf == undefined" },
    },
    {
      name: "responsiblePeople",
      title: "Ansvarlig ansatt",
      type: "array",
      of: [responsibleStaff],
    },
  ],
};
