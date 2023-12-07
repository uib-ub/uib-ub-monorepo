import { timespan } from "../props";

export default {
  name: "delegation",
  type: "object",
  fields: [
    {
      name: "organization",
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
