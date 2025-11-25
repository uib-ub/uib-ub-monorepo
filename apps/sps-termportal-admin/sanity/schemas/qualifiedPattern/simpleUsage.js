export default {
  name: "simpleUsage",
  title: "Gjør bruk av ressurs",
  type: "object",

  fields: [
    {
      name: "asset",
      title: "Ressurs",
      type: "reference",
      to: [{ type: "asset" }],
    },
  ],
  preview: { select: { title: "asset.label" } },
};
