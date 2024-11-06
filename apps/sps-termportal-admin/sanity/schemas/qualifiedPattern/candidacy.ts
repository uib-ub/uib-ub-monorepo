import { topDomains } from "~/utils/constants";

export default {
  name: "candidacy",
  type: "object",
  title: "Interesseområde",
  fieldsets: [{ name: "scope", options: { columns: 2 } }],
  fields: [
    {
      name: "domain",
      type: "string",
      title: "UHR domene",
      options: {
        list: Object.keys(topDomains).map((key) => {
          return { title: topDomains[key], value: key };
        }),
      },
    },
    { name: "subdomain", type: "string" },
    {
      name: "termgroup",
      title: "Termgruppe",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "refgroup",
      title: "Referansegruppe",
      type: "boolean",
      initialValue: false,
    },
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
        titleCombined = topDomains[selection.title];
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
