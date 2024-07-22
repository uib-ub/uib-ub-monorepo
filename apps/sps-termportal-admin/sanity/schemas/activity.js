import { label, note, timespan } from "./props";
import association from "./qualifiedPattern/association";
import communication from "./qualifiedPattern/communication";
import simpleUsage from "./qualifiedPattern/simpleUsage";
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
      title: "Omfang",
      type: "array",
      of: [usage],
    },
    {
      name: "type",
      type: "string",
      title: "Aktivitetstype",
      options: {
        list: Object.keys(activityTypes).map((key) => {
          return { title: activityTypes[key], value: key };
        }),
      },
    },
    {
      name: "usage",
      title: "Gjør bruk av",
      type: "array",
      of: [simpleUsage],
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
