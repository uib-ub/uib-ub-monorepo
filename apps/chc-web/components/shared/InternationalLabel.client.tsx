'use client'
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon, } from '@radix-ui/react-icons';
import { omit } from 'lodash'

// eslint-disable-next-line react/display-name
const AccordionTrigger = React.forwardRef(({ children, className, ...props }: Accordion.AccordionTriggerProps, forwardedRef: any) => (
  <Accordion.Header className="AccordionHeader">
    <Accordion.Trigger
      className={`flex content-between items-center`}
      {...props}
      ref={forwardedRef}
    >
      <span className='font-bold'>
        {children}
      </span>
      <ChevronDownIcon className="ml-3" aria-hidden />
    </Accordion.Trigger>
  </Accordion.Header>
));

export const InternationalLabel = (
  {
    label,
    lang
  }: {
    label: {
      [key: string]: any
    },
    lang: string
  }) => {

  const rest: any = {
    ...omit(label, [lang])
  }

  if (Object.keys(label).length > 1) {
    return (
      <div className="my-4 ring-2 ring-offset-8 ring-blue-700 rounded-sm before:content-['InternationalLabel'] before:relative before:bg-white before:-top-[22px] before:px-2">
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="item-1">
            <AccordionTrigger>
              <span className='text-4xl'>
                {label[lang]}
              </span>
            </AccordionTrigger>
            <Accordion.Content className="overflow-hidden">
              {rest ? (
                <>
                  {Object.entries(rest).map((value: any, key: any) => (
                    <div key={key} className="py-1">{value[1]}</div>
                  ))}
                </>
              ) : null}
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    )
  }

  return (
    <div className="my-4 ring-2 ring-offset-8 ring-blue-700 rounded-sm before:content-['InternationalLabel'] before:relative before:bg-white before:-top-[22px] before:px-2">
      <div className='text-4xl font-bold'>
        {label[lang] ?? Object.values(label)[0]}
      </div>
    </div>
  );
}