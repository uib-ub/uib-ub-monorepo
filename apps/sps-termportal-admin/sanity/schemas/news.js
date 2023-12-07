export default {
  name: "news",
  type: "document",
  title: "Nyhet",
  fields: [
    { name: "date", title: "Dato", type: "date" },
    {
      name: "sectionNb",
      title: "Bokmål",
      type: "object",
      fields: [
        {
          name: "titleNb",
          type: "string",
          title: "Tittel",
        },
        {
          name: "previewTextNb",
          title: "Forhåndsvis tekst",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "mainTextNb",
          title: "Hovedtekst",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
    {
      name: "sectionNn",
      title: "Nynorsk",
      type: "object",
      fields: [
        {
          name: "titleNn",
          type: "string",
          title: "Tittel",
        },
        {
          name: "previewTextNn",
          title: "Forhåndsvis tekst",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "mainTextNn",
          title: "Hovedtekst",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
    {
      name: "sectionEn",
      title: "Engelsk",
      type: "object",
      fields: [
        {
          name: "titleEn",
          type: "string",
          title: "Tittel",
        },
        {
          name: "previewTextEn",
          title: "Forhåndsvis tekst",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "mainTextEn",
          title: "Hovedtekst",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "sectionNb.titleNb",
      date: "dato",
    },
  },
};
