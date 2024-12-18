import Link from 'next/link'
import React from 'react'
import { BsFillQuestionCircleFill } from 'react-icons/bs'
import { defineType } from 'sanity'
import { defaultFieldsets } from '../../../../fieldsets/defaultFieldsets'
import { carriedOutBy, referredToBy, timespan, tookPlaceAt, usedGeneralTechnique, usedObjectOfType, usedSpecificObject, usedSpecificTechnique } from '../../../properties/object'

export default defineType({
  name: 'Treatment',
  title: 'Behandling',
  titleEN: 'Treatment',
  type: 'object',
  fieldsets: defaultFieldsets,
  fields: [
    carriedOutBy,
    timespan,
    tookPlaceAt,
    referredToBy,
    usedGeneralTechnique,
    usedSpecificTechnique,
    usedObjectOfType,
    usedSpecificObject,
    {
      name: 'assessedBy',
      title: 'Vurdert av',
      description: (
        <span>
          Legg til en vurdering av behandlingen. Var det en suksess?{' '}
          <Link target="blank" href={'https://muna.xyz/docs/model/properties#assessment'}>
            <BsFillQuestionCircleFill />
          </Link>
        </span>
      ),
      type: 'array',
      of: [{ type: 'TreatmentAssessment' }],
      options: {
        semanticSanity: {
          '@container': '@set',
          '@type': '@id'
        }
      },
    },
  ],
  preview: {
    select: {
      date: 'timespan',
    },
    prepare(selection) {
      const { date } = selection
      return {
        title: `Behandling${date ? `, datert ${date}` : ''}`,
      }
    },
  },
})
