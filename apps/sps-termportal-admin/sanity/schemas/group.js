import { label, note } from "./props";
import consultation from "./qualifiedPattern/consultation";
import membership from "./qualifiedPattern/membership";

export default {
  name: "group",
  type: "document",
  title: "Gruppe",
  liveEdit: true,
  fields: [
    label,
    note,
    {
      name: "qualifiedMembership",
      type: "array",
      title: "Gruppemedlem",
      of: [membership],
    },
    {
      name: "qualifiedConsultation",
      type: "array",
      title: "Referansegruppe",
      of: [consultation],
    },
  ],
};
