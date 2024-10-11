export default {
  name: "association",
  title: "Utført av person, gruppe eller organisasjon",
  type: "object",
  fields: [
    {
      name: "agent",
      title: "Person, gruppe eller organisasjon",
      type: "reference",
      to: [{ type: "person" }, { type: "group" }, { type: "organization" }],
    },
  ],
  preview: { select: { title: "agent.label" } },
};
