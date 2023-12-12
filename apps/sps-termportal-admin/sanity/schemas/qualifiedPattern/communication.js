export default {
  name: "communication",
  type: "object",
  fields: [
    {
      name: "activity",
      type: "reference",
      to: [{ type: "activity" }],
    },
  ],
  preview: { select: { title: "activity.label" } },
};
