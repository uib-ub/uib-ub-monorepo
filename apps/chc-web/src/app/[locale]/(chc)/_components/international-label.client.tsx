"use client";
import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { LanguagesIcon, ChevronDownIcon } from "lucide-react";
import { omit } from "lodash";

// eslint-disable-next-line react/display-name
const AccordionTrigger = React.forwardRef(
  (
    { key, children, className, ...props }: Accordion.AccordionTriggerProps,
    forwardedRef: any
  ) => (

    <Accordion.Trigger
      className={`flex content-between items-center`}
      {...props}
      ref={forwardedRef}
    >
      <span className="font-bold">{children}</span>

      <LanguagesIcon className="ml-3 h-4 w-4" aria-hidden />
      <ChevronDownIcon className="h-3 w-3" aria-hidden />
    </Accordion.Trigger>

  )
);

export const InternationalLabel = ({
  label,
  lang,
}: {
  label: {
    [key: string]: any;
  };
  lang: string;
}) => {
  if (!label) {
    return <div className="text-4xl font-bold">Missing title</div>;
  }

  const rest: any = {
    ...omit(label, [lang]),
  };

  if (Object.keys(label).length > 1) {
    return (
      <Accordion.Root type="single" collapsible className="mb-3">
        <Accordion.Item value="item-1">
          <Accordion.Header className="AccordionHeader">
            <AccordionTrigger>
              <span className="text-4xl">{label[lang]}</span>
            </AccordionTrigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            {rest ? (
              <>
                {Object.entries(rest).map((value: any, key: any) => (
                  <div key={key} className="py-1">
                    {value[1]}
                  </div>
                ))}
              </>
            ) : null}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );
  }

  return (
    <div className="mb-3 text-4xl font-bold">
      {label[lang] ?? Object.values(label)[0]}
    </div>
  );
};
