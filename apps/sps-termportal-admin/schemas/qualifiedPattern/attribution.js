import { dates } from "../fieldsets";
import { endedAt, startedAt } from "../props";

export default {
  name: "attribution",
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
  preview: {
    select: {
      title: "group.label",
      startedAt: "startedAt",
      endedAt: "endedAt",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: formatTimespan(selection.startedAt, selection.endedAt),
      };
    },
  },
};
