export const note = { name: "note", type: "text", rows: 2 };

export const label = { name: "label", type: "string" };

export const email = { name: "email", type: "string" };

export const tbstatus = {
  name: "status",
  type: "string",
  options: {
    list: [
      { title: "Publisert", value: "published" },
      { title: "Opprettet", value: "created" },
      { title: "Planlagt", value: "planned" },
    ],
  },
};
export const timespan = {
  name: "timespan",
  type: "Timespan",
};
