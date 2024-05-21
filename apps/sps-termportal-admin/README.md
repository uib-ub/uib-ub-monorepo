# Termportalen admin app

## Use of react components in admin app
The app is a nuxt 3 app with an embedded Sanity studio which is a
react application. It is possible to extend/customize Sanity studio
with react components and those need to be handled correctly by vite.

With the current setup, the JSX-format is not transpiled correctly.
However, it is possible to avoid the transpiling step and dicectly use
the `createElement`-syntax:

```
import { createElement } from "react";

export const blockContent = {
  type: "block",
  marks: {
    annotations: [...],
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
```
