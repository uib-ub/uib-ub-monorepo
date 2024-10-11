import { timespan } from "../props";

export default {
  name: "delegation",
  title: "Organisasjon",
  type: "object",
  fields: [
    {
      name: "organization",
      title: "Organisasjon",
      type: "reference",
      to: [{ type: "organization" }],
    },
    timespan,
  ],
  preview: {
    select: {
      title: "organization.label",
      subtitle: "timespan.edtf",
    },
  },
};
