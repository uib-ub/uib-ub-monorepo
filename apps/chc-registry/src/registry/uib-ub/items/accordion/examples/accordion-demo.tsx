import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/accordion';

export default function ButtonDemo() {
  return (
    <div className='flex flex-column flex-wrap gap-5 m-5 w-full not-prose'>
      <Accordion type='multiple' className='w-full'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>
            <h3>Accordion Item 1</h3>
          </AccordionTrigger>
          <AccordionContent>
            <p>Accordion Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>
            <h3>Accordion Item 2</h3>
          </AccordionTrigger>
          <AccordionContent>
            <p>Accordion Content 2</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}