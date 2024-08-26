import { label, note, timespan } from "./props";

export default {
  name: "asset",
  title: "Ressurs",
  type: "document",
  liveEdit: true,
  fields: [label, timespan, note],
  preview: {
    select: {
      title: "label",
      subtitle: "timespan.edtf",
    },
  },
};
