import { email, label, note } from "./props";
import delegation from "./qualifiedPattern/delegation";

export default {
  name: "person",
  type: "document",
  liveEdit: "true",
  fields: [
    label,
    email,
    note,
    {
      name: "qualifiedDelegation",
      type: "array",
      title: "Organisasjon",
      of: [delegation],
    },
  ],
};
