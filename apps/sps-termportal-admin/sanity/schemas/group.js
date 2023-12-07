import { label, note } from "./props";
import consultation from "./qualifiedPattern/consultation";
import membership from "./qualifiedPattern/membership";

export default {
  name: "group",
  type: "document",
  liveEdit: "true",
  fields: [
    label,
    note,
    {
      name: "qualifiedMembership",
      type: "array",
      of: [membership],
    },
    { name: "qualifiedConsultation", type: "array", of: [consultation] },
  ],
};
