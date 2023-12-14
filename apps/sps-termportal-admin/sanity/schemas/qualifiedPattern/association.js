export default {
  name: "association",
  type: "object",
  fields: [
    {
      name: "agent",
      type: "reference",
      to: [{ type: "person" }, { type: "group" }, { type: "organization" }],
    },
  ],
  preview: { select: { title: "agent.label" } },
};
