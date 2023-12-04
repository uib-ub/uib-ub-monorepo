export default {
  name: "activity",
  type: "document",
  title: "Aktivitet",
  fields: [
    { name: "title", type: "string", titel: "Tittel" },
    {
      name: "scope",
      type: "string",
      options: {
        list: [
          { title: "Termbaser", value: "termbase" },
          { title: "Frontend", value: "frontend" },
          { title: "Redigeringsapplikasjon", value: "editor" },
        ],
      },
    },
    {
      name: "termbase",
      title: "Termbase",
      type: "reference",
      to: [{ type: "termbase" }],
      hidden: ({ parent }) => parent?.scope != "termbase",
    },
  ],
};
