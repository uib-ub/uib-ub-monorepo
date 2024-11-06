import { topDomains } from "~/utils/constants";
import { label, note, responsibleStaff, tbstatus } from "./props";
import attribution from "./qualifiedPattern/attribution";

export default {
  name: "termbase",
  type: "document",
  liveEdit: true,
  fieldsets: [
    {
      name: "basics",
      title: "Generell informasjon",
      options: {
        columns: 2,
        collapsible: true,
      },
    },
    {
      name: "unpublished",
      title: "Planleggingsdata",
      options: {
        collapsible: true,
        collapsed: true,
        columns: 2,
      },
    },
  ],
  fields: [
    label,
    {
      name: "id",
      title: "ID",
      type: "string",
      description:
        "Minst tre bokstaver. Hovedsaklig brukt i teknisk sammenheng.",
    },
    {
      name: "type",
      type: "string",
      title: "Termbasetype",
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
      name: "topdomain",
      title: "Domene",
      type: "string",
      fieldset: "unpublished",
      options: {
        list: Object.entries(topDomains).map((domain) => {
          return { value: domain[0], title: domain[1] };
        }),
      },
    },
    {
      name: "domain",
      title: "Subdomene",
      type: "string",
      fieldset: "unpublished",
    },
    {
      name: "size",
      title: "Antall begreper",
      description: "Estimat",
      type: "number",
      fieldset: "unpublished",
    },
    {
      name: "labelsOk",
      type: "boolean",
      title: "Termbasenavn gjennomgått",
      initialValue: false,
      fieldset: "basics",
    },
    {
      name: "descriptionsOk",
      type: "boolean",
      title: "Termbasebeskrivelser gjennomgått",
      initialValue: false,
      fieldset: "basics",
    },
    {
      name: "licenseAgreementStatus",
      type: "string",
      title: "Lisensavtalestatus",
      description: "mellom termportalen og leverandør",
      fieldset: "basics",
      options: {
        list: [
          { title: "Ingen", value: "ingen" },
          { title: "Avklart", value: "avklart" },
          { title: "Signert", value: "signert" },
        ],
      },
      initialValue: "ingen",
    },
    {
      name: "reminderInterval",
      title: "Påminnelsesintervall",
      description: "Intervall beskrevet i dager",
      type: "number",
      fieldset: "basics",
      initialValue: reportReminder.interval.reminder,
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
      description: "Gruppe som er ansvarlig eller eier ressurs",
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
