import { dates } from "./fieldsets";
import { endedAt, label, note, startedAt } from "./props";
import communication from "./qualifiedPattern/communication";
import usage from "./qualifiedPattern/usage";

export default {
  name: "activity",
  type: "document",
  liveEdit: "true",
  fieldsets: [dates],
  fields: [
    label,
    startedAt,
    endedAt,
    note,
    {
      name: "qualifiedUsage",
      type: "array",
      of: [usage],
    },
    { name: "qualifiedCommunication", type: "array", of: [communication] },
  ],
  preview: {
    select: {
      title: "label",
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
