export default defineAppConfig({
  domains: {
    topdomainOrder: [
      "NaturvitenskapTeknologi",
      "Humaniora",
      "Samfunnsfag",
      "Helse_og_sosial",
      "OkonomiAdministrasjon",
      "Kunst_design_arkitektur",
      "Lærerutdanning",
    ],
  },
  ui: {
    color: {
      status: {
        error: { class: "text-red-500" },
        warning: { class: "text-amber-400" },
        ok: { class: "text-green-600" },
      },
    },
    headingTextClassOptions: {
      h2: "text-2xl font-semibold",
      h3: "text-2xl",
      h4: "text-xl",
    } as const,
  },
});
