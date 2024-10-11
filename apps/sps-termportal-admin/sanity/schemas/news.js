import { blockContent } from "./props";

const languages = [
  { value: "nb", label: "Bokmål" },
  { value: "nn", label: "Nynorsk" },
  { value: "en", label: "Engelsk" },
];

export default {
  name: "news",
  type: "document",
  title: "Nyhet",
  fieldsets: [
    {
      name: "nb",
      title: "Bokmål",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "nn",
      title: "Nynorsk",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "en",
      title: "Engelsk",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    {
      name: "date",
      title: "Dato",
      description: "Vises på forsiden og brukes til å sortere innlegg",
      type: "datetime",
    },
  ].concat(
    languages
      .map((lang) => [
        {
          name: "title" + lang.value,
          type: "string",
          title: "Tittel",
          fieldset: lang.value,
        },
        {
          name: "content" + lang.value,
          type: "array",
          title: "Tekst",
          of: [blockContent],
          fieldset: lang.value,
        },
      ])
      .flat()
  ),
  preview: {
    select: {
      nb: "titlenb",
      nn: "titlenn",
      en: "titleen",
      date: "date",
    },
    prepare(selection) {
      const { nb, nn, en, date } = selection;
      return { title: nb || nn || en, subtitle: date };
    },
  },
  orderings: [
    {
      title: "Date",
      name: "date",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
};
