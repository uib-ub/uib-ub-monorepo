import { createElement } from "react";

export const blockContent = {
  type: "block",
  marks: {
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Link",
        fields: [
          {
            name: "href",
            type: "url",
            title: "URL",
          },
          {
            title: "Open in new tab",
            name: "newtab",
            type: "boolean",
            initialValue: true,
          },
        ],
        components: {
          annotation: (props) => {
            return createElement(
              "span",
              {},
              createElement(
                "a",
                {
                  contentEditable: false,
                  href: props.value.href,
                  target: "_blank",
                },
                props.renderDefault(props)
              )
            );
          },
        },
      },
    ],
  },
};

export const note = {
  name: "note",
  type: "array",
  title: "Merknad",
  of: [blockContent],
};

export const label = { name: "label", type: "string" };

export const email = { name: "email", type: "string" };

export const tbstatus = {
  name: "status",
  type: "string",
  options: {
    list: [
      { title: "Kjent", value: "kjent" },
      { title: "Planlagt", value: "planlagt" },
      { title: "Initialisert", value: "initialisert" },
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
