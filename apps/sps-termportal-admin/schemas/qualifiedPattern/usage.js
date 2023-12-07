export default {
  name: "usage",
  type: "object",
  fields: [
    {
      name: "scope",
      type: "reference",
      to: [{ type: "scope" }],
      options: {
        filter: "isPartOf == undefined",
      },
    },
    {
      name: "termbase",
      type: "reference",
      to: [{ type: "termbase" }],
      hidden: ({ parent }) =>
        parent?.scope?._ref !== "eb281dfd-073c-4a9e-b2a0-95a6e25f3516",
    },
    {
      name: "group",
      type: "reference",
      to: [{ type: "group" }],
      hidden: ({ parent }) =>
        parent?.scope?._ref !== "c1f42563-f4e1-4152-8cb8-558362faaf4f",
    },
    {
      name: "subscope",
      type: "reference",
      to: [{ type: "scope" }],
      options: {
        filter: ({ parent, value }) => {
          if (parent.scope) {
            return {
              filter: "isPartOf._ref == $scope",
              params: { scope: parent.scope._ref },
            };
          }
        },
      },
      hidden: ({ parent }) =>
        !(
          parent?.scope?._ref !== "c1f42563-f4e1-4152-8cb8-558362faaf4f" &&
          parent?.scope?._ref !== "eb281dfd-073c-4a9e-b2a0-95a6e25f3516"
        ),
    },
  ],
  preview: {
    select: {
      title: "scope.label",
      termbase: "termbase.label",
      termgroup: "termgroup.label",
      subscope: "subscope.label",
    },
    prepare(selection) {
      let title = selection?.title;
      if (selection?.termbase) {
        title += ">" + selection?.termbase;
      } else if (selection.termgroup) {
        title += " > " + selection?.termgroup;
      } else if (selection.subscope) {
        title += " > " + selection?.subscope;
      }
      return { title };
    },
  },
};
