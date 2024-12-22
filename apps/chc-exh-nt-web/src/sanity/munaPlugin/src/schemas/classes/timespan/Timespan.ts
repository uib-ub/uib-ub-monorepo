import { defineType } from 'sanity'
import { timespanAsString } from '../../../helpers'

export default defineType({
  name: 'Timespan',
  type: 'object',
  title: 'Tidsspenn',
  fieldsets: [
    {
      name: 'beginning',
      title: 'Start',
      options: {
        collapsible: false,
        columns: 2,
      },
    },
    {
      name: 'ending',
      title: 'Slutt',
      options: {
        collapsible: false,
        columns: 2,
      },
    },
  ],
  fields: [
    {
      name: 'beginOfTheBegin',
      title: 'Begynnelsen av begynnelsen',
      fieldset: 'beginning',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        calendarTodayLabel: 'Today',
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
      // Validation on min/max date does not work, also handling of undefined is sub par
      // validation: Rule => Rule.max(Rule.valueOfField('endOfTheBegin')).max(Rule.valueOfField('BeginOfTheEnd')).max(Rule.valueOfField('endOfTheEnd'))
    },
    {
      name: 'endOfTheBegin',
      title: 'Slutten på begynnelsen',
      fieldset: 'beginning',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        calendarTodayLabel: 'Today',
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
    },
    {
      name: 'edtf',
      title: 'EDTF',
      type: 'string',
    },
    {
      name: 'date',
      title: 'Dato',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        calendarTodayLabel: 'Today',
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
    },
    {
      name: 'beginOfTheEnd',
      title: 'Begynnelsen av slutten',
      fieldset: 'ending',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        calendarTodayLabel: 'Today',
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
    },
    {
      name: 'endOfTheEnd',
      title: 'Slutten av slutten',
      fieldset: 'ending',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        calendarTodayLabel: 'Today',
        semanticSanity: {
          "@type": "xsd:dateTime"
        }
      },
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'LocaleBlock',
      options: {
        semanticSanity: {
          '@type': '@json'
        }
      },
    },
  ],
  preview: {
    select: {
      bb: 'beginOfTheBegin',
      eb: 'endOfTheBegin',
      date: 'date',
      be: 'beginOfTheEnd',
      ee: 'endOfTheEnd',
      blocks: 'description.nor',
    },
    prepare(selection) {
      const { bb, eb, date, be, ee, blocks } = selection
      const desc = (blocks || []).find((block: any) => block._type === 'block')
      const timespan = timespanAsString(bb, eb, date, be, ee, 'nb')

      return {
        title: timespan,
        subtitle: desc
          ? desc.children
            .filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
          : '',
      }
    },
  },
})
