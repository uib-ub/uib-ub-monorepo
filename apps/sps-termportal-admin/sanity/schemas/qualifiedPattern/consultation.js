import { timespan } from "../props";

export default {
  name: "consultation",
  title: "Referansegruppe",
  type: "object",

  fields: [
    {
      name: "group",
      title: "gruppe",
      type: "reference",
      to: [{ type: "group" }],
    },
    timespan,
  ],
  preview: { select: { title: "group.label", subtitle: "timespan.edtf" } },
};
