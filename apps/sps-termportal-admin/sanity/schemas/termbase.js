import { label, note, responsibleStaff, tbstatus } from "./props";
import attribution from "./qualifiedPattern/attribution";

export default {
  name: "termbase",
  type: "document",
  liveEdit: true,
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
  initialValue: { licenseAgreementStatus: "ingen" },
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
    },
    {
      name: "licenseAgreementStatus",
      type: "string",
      fieldset: "status",
      options: {
        list: [
          { title: "Ingen", value: "ingen" },
          { title: "Avklart", value: "avklart" },
          { title: "Signert", value: "signert" },
        ],
      },
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
      title: "Termgruppe eller organisasjon",
      of: [attribution],
    },
  ],
  preview: {
    select: {
      title: "label",
      id: "id",
    },
  },
};
