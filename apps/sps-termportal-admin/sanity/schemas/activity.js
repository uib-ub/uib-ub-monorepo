import { label, note, timespan } from "./props";
import communication from "./qualifiedPattern/communication";
import usage from "./qualifiedPattern/usage";

export default {
  name: "activity",
  type: "document",
  liveEdit: "true",
  fields: [
    label,
    note,
    timespan,
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
      subtitle: "timespan.edtf",
    },
  },
};
