import { email, label, note } from "./props";
import delegation from "./qualifiedPattern/delegation";
import candidacy from "./qualifiedPattern/candidacy";

export default {
  name: "person",
  type: "document",
  title: "Person",
  liveEdit: true,
  fieldsets: [
    { name: "personbank", options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    label,
    email,
    note,
    {
      name: "lastUpdated",
      title: "Sist oppdatert",
      type: "date",
      fieldset: "personbank",
    },
    {
      name: "candidacy",
      type: "array",
      fieldset: "personbank",
      of: [candidacy],
    },

    {
      name: "qualifiedDelegation",
      type: "array",
      title: "Organisasjon",
      of: [delegation],
    },
  ],
};
