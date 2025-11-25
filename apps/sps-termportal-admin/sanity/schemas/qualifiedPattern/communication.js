export default {
  name: "communication",
  title: "Tilhørende aktivitet",
  type: "object",
  fields: [
    {
      name: "activity",
      title: "Aktivitet",
      type: "reference",
      to: [{ type: "activity" }],
    },
  ],
  preview: { select: { title: "activity.label" } },
};
