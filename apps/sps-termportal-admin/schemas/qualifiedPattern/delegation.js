import { dates } from "../fieldsets";
import { endedAt, startedAt } from "../props";

export default {
  name: "delegation",
  type: "object",
  fieldsets: [dates],
  fields: [
    {
      name: "organization",
      type: "reference",
      to: [{ type: "organization" }],
    },
    startedAt,
    endedAt,
  ],
  preview: {
    select: {
      title: "organization.label",
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
