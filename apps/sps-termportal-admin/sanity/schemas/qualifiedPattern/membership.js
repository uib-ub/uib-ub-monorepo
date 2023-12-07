import { timespan } from "../props";

export default {
  name: "membership",
  type: "object",

  fields: [
    {
      name: "person",
      type: "reference",
      to: [{ type: "person" }],
    },
    {
      name: "role",
      type: "string",
      options: {
        list: [
          { title: "Koordinator", value: "koordinator" },
          { title: "Medlem", value: "medlem" },
          { title: "Veileder", value: "veileder" },
        ],
      },
    },
    timespan,
  ],
  preview: {
    select: {
      title: "person.label",
      role: "role",
      timespan: "timespan.edtf",
    },
    prepare(selection) {
      return {
        title: `${selection.title} ${
          selection.role ? "(" + selection.role + ")" : ""
        }`,
        subtitle: selection.timespan,
      };
    },
  },
};
