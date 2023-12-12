export const note = { name: "note", type: "text", rows: 2 };

export const label = { name: "label", type: "string" };

export const email = { name: "email", type: "string" };

export const tbstatus = {
  name: "status",
  type: "string",
  options: {
    list: [
      { title: "Planlagt", value: "planlagt" },
      { title: "Opprettet", value: "opprettet" },
      { title: "Publisert", value: "publisert" },
    ],
  },
  fieldset: "basics",
};
export const timespan = {
  name: "timespan",
  type: "Timespan",
};

export const responsibleStaff = {
  name: "responsibleStaff",
  type: "reference",
  to: [{ type: "person" }],
};
