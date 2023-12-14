import { label, note, responsibleStaff, tbstatus } from "./props";
import attribution from "./qualifiedPattern/attribution";

export default {
  name: "termbase",
  type: "document",
  liveEdit: "true",
  fieldsets: [
    {
      name: "status",
      options: {
        collapsible: true,
        collapsed: false,
        columns: 2,
      },
    },
    {
      name: "basics",
      options: {
        columns: 2,
      },
    },
  ],
  fields: [
    label,
    {
      name: "id",
      type: "string",
    },
    {
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Aktiv", value: "aktiv" },
          { title: "Historisk", value: "historisk" },
        ],
      },
      fieldset: "basics",
    },
    tbstatus,
    {
      name: "labelsOk",
      type: "boolean",
      initialValue: false,
      fieldset: "status",
    },
    {
      name: "descriptionsOk",
      type: "boolean",
      initialValue: false,
      fieldset: "status",
    },
    {
      name: "hasLicenseAgreement",
      type: "boolean",
      initialValue: false,
      fieldset: "status",
    },
    note,
    responsibleStaff,
    {
      name: "contactPerson",
      type: "array",
      of: [
        {
          name: "person",
          type: "reference",
          to: [{ type: "person" }],
        },
      ],
    },
    { name: "qualifiedAttribution", type: "array", of: [attribution] },
  ],
  preview: {
    select: {
      title: "label",
      id: "id",
    },
  },
};
