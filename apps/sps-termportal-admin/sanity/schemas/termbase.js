import { label, note, responsibleStaff, tbstatus } from "./props";
import attribution from "./qualifiedPattern/attribution";
import attributionOrga from "./qualifiedPattern/attributionOrga";

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
    {
      name: "unpublished",
      title: "Planleggingsdata",
      options: {
        columns: 2,
      },
      hidden: ({ document }) => document?.status === "publisert",
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
    { name: "domain", type: "string", fieldset: "unpublished" },
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
      title: "Kontakt",
      of: [
        {
          name: "person",
          type: "reference",
          to: [{ type: "person" }, { type: "organization" }],
        },
      ],
    },
    {
      name: "qualifiedAttribution",
      type: "array",
      title: "Termgruppe",
      of: [attribution],
    },
    {
      name: "qualifiedOrgaAttribution",
      type: "array",
      title: "Organisasjon",
      of: [attributionOrga],
    },
  ],
  preview: {
    select: {
      title: "label",
      id: "id",
    },
  },
};
