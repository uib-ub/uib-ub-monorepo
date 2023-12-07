import { dates } from "../fieldsets";
import { endedAt, startedAt } from "../props";

export default {
  name: "consultation",
  type: "object",
  fieldsets: [dates],
  fields: [
    {
      name: "group",
      type: "reference",
      to: [{ type: "group" }],
    },
    startedAt,
    endedAt,
  ],
  preview: { select: { title: "group.label" } },
};
