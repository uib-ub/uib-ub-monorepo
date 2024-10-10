import { domainsUhr } from "~/utils/constants";

export default {
  name: "candidacy",
  type: "object",
  fieldsets: [{ name: "scope", options: { columns: 2 } }],
  fields: [
    // UHR domains
    {
      name: "domain",
      type: "string",
      title: "UHR domene",
      options: {
        list: Object.keys(domainsUhr).map((key) => {
          return { title: domainsUhr[key], value: key };
        }),
      },
    },
    // freetext domain
    { name: "subdomain", type: "string" },
    // termgroup
    { name: "termgroup", type: "boolean", initialValue: false },
    // ref group
    { name: "refgroup", type: "boolean", initialValue: false },
  ],
  preview: {
    select: {
      title: "domain",
      subdomain: "subdomain",
      termgroup: "termgroup",
      refgroup: "refgroup",
    },
    prepare(selection) {
      let titleCombined = "";
      if (selection.title) {
        titleCombined = domainsUhr[selection.title];
      }
      if (selection.subdomain) {
        titleCombined += " / " + selection.subdomain;
      }

      let subtitleCombined = "";
      if (selection.termgroup) {
        subtitleCombined += "termgruppe";
      }
      if (selection.termgroup && selection.refgroup) {
        subtitleCombined += ", ";
      }
      if (selection.refgroup) {
        subtitleCombined += "referansegruppe";
      }

      return { title: titleCombined, subtitle: subtitleCombined };
    },
  },
};
