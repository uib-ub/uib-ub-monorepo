import { dates } from "../fieldsets";
import { endedAt, startedAt } from "../props";

export default {
  name: "membership",
  type: "object",
  fieldsets: [dates],
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
    startedAt,
    endedAt,
  ],
  preview: {
    select: {
      title: "person.label",
      role: "role",
      startedAt: "startedAt",
      endedAt: "endedAt",
    },
    prepare(selection) {
      return {
        title: `${selection.title} ${
          selection.role ? "(" + selection.role + ")" : ""
        }`,
        subtitle: formatTimespan(selection.startedAt, selection.endedAt),
      };
    },
  },
};
