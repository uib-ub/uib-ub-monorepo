export default {
  name: "termbase",
  type: "document",
  liveEdit: "true",
  fields: [
    {
      name: "name",
      type: "string",
      title: "Name",
    },
    {
      name: "id",
      type: "string",
      title: "ID",
    },
    {
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Published", value: "published" },
          { title: "Created", value: "created" },
          { title: "Planned", value: "planned" },
        ],
      },
    },
    {
      name: "responsibleStaff",
      type: "reference",
      title: "Responsible staff member",
      to: [{ type: "person" }],
      options: {
        filter: "staff == true",
      },
    },
    {
      name: "qualifiedAttribution",
      type: "array",
      title: "Termgroup membership",
      of: [
        {
          name: "Attribution",
          type: "object",
          initialValue: { hadRole: "member" },
          fieldsets: [
            { name: "dates", title: "Dates", options: { columns: 2 } },
          ],
          fields: [
            { name: "person", type: "reference", to: [{ type: "person" }] },
            {
              name: "hadRole",
              type: "string",
              options: {
                list: [
                  { title: "Member", value: "member" },
                  { title: "Editor", value: "editor" },
                ],
              },
            },
            { name: "start", type: "date", title: "Start", fieldset: "dates" },
            { name: "end", type: "date", title: "End", fieldset: "dates" },
          ],
          preview: {
            select: {
              lastname: "person.lastname",
              firstname: "person.firstname",
            },
            prepare(selection) {
              const { lastname, firstname } = selection;
              return { title: `${lastname}, ${firstname}` };
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      id: "id",
    },
  },
};
