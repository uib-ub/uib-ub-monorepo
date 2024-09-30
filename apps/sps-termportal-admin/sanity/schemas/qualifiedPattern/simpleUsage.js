export default {
  name: "simpleUsage",
  type: "object",

  fields: [
    {
      name: "asset",
      type: "reference",
      to: [{ type: "asset" }],
    },
  ],
  preview: { select: { title: "asset.label" } },
};
