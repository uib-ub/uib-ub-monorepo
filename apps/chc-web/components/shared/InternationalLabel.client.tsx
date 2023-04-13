'use client'
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { LanguageIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { omit } from 'lodash'
import { Boundary } from './Boundary';

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

      <LanguageIcon className="ml-3 w-4 h-4" aria-hidden />
      <ChevronDownIcon className="w-3 h-3" aria-hidden />
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
  if (!label) {
    return (
      <Boundary color='orange' labels={['InternationalLabel (client)']} size='small'>
        <div className='text-4xl font-bold'>
          Missing title
        </div>
      </Boundary>
    );
  }

  const rest: any = {
    ...omit(label, [lang])
  }

  if (Object.keys(label).length > 1) {
    return (
      <Boundary color='orange' labels={['InternationalLabel (client)']} size='small'>
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
      </Boundary>
    )
  }

  return (
    <Boundary color='orange' labels={['InternationalLabel (client)']} size='small'>
      <div className='text-4xl font-bold'>
        {label[lang] ?? Object.values(label)[0]}
      </div>
    </Boundary>
  );
}