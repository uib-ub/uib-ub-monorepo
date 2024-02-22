import { label, note, timespan } from "./props";
import association from "./qualifiedPattern/association";
import communication from "./qualifiedPattern/communication";
import usage from "./qualifiedPattern/usage";

export default {
  name: "activity",
  type: "document",
  title: "Aktivitet",
  liveEdit: true,
  fields: [
    label,
    note,
    timespan,
    {
      name: "qualifiedUsage",
      type: "array",
      of: [usage],
    },
    {
      name: "type",
      type: "string",
      title: "Aktivitetstype",
      options: {
        list: [
          { title: "Termbase opprettelse", value: "termbaseOpprettelse" },
          { title: "Termbase importering", value: "termbaseImportering" },
          { title: "Termbase publisering", value: "termbasePublisering" },
        ],
      },
    },
    {
      name: "qualifiedAssociation",
      title: "Utført av",
      type: "array",
      of: [association],
    },
    {
      name: "qualifiedCommunication",
      title: "Tilhørende aktivitet",
      type: "array",
      of: [communication],
    },
  ],
  preview: {
    select: {
      title: "label",
      subtitle: "timespan.edtf",
    },
  },
  orderings: [
    {
      title: "Beginning of Activity",
      name: "beginOfTheBegin",
      by: [{ field: "timespan.beginOfTheBegin", direction: "desc" }],
    },
    {
      title: "End of Activity",
      name: "beginOfTheBegin",
      by: [{ field: "timespan.endOfTheEnd", direction: "desc" }],
    },
  ],
};
