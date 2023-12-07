import { timespan } from "../props";

export default {
  name: "attribution",
  type: "object",
  fields: [
    {
      name: "group",
      type: "reference",
      to: [{ type: "group" }],
    },
    timespan,
  ],
  preview: {
    select: {
      title: "group.label",
      subtitle: "timespan.edtf",
    },
  },
};
