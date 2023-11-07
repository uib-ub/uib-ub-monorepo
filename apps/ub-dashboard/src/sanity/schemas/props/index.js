import React from 'react'
import { BsFillQuestionCircleFill } from 'react-icons/bs'
import { Link } from 'sanity/router'
import { licenseTypes } from '../vocabularies/defaultVocabularies'
import { client } from '../../lib/client'

export const hasType = {
  name: 'hasType',
  title: 'Klassifisert som',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'Concept' }],
    },
  ],
  validation: (Rule) => Rule.required(),
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  }
}

export const sameAs = {
  name: 'sameAs',
  title: 'Samme som',
  type: 'array',
  of: [{ type: 'url' }],
  options: {
    semanticSanity: {
      '@id': 'http://www.w3.org/2002/07/owl#sameAs',
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const editorialState = {
  name: 'editorialState',
  title: 'Status',
  type: 'string',
  fieldset: 'state',
  initialValue: 'published',
  options: {
    list: [
      { title: 'Til gjennomgang', value: 'review' },
      { title: 'Publisert', value: 'published' },
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
}

export const accessState = {
  name: 'accessState',
  title: 'Tilgangsstatus',
  type: 'string',
  fieldset: 'state',
  initialValue: 'open',
  options: {
    list: [
      { title: 'Privat', value: 'secret' },
      { title: 'Open', value: 'open' },
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
}

export const uses = {
  name: 'uses',
  title: 'Uses',
  description: 'Programvare-avhengigheter',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Software' },
    ]
  }],
  options: {
    semanticSanity: {
      '@type': '@id'
    }
  }
}

export const dependencies = {
  name: 'dependencies',
  title: 'Dependencies',
  description: 'Services and/or endpoints this service is dependent on.',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Service' },
      { type: 'Endpoint' },
    ]
  }],
  options: {
    semanticSanity: {
      '@type': '@id'
    }
  }
}

export const resultedIn = {
  name: 'resultedIn',
  title: 'Resulted in',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Software' },
      { type: 'VolatileSoftware' },
      { type: 'SoftwareComputingEService' },
      { type: 'Group' },
      { type: 'Product', title: 'Produkt (ikke bruk)' },
      { type: 'Service', title: 'Tjeneste (ikke bruk)' },
    ]
  }],
  options: {
    semanticSanity: {
      '@type': '@id'
    }
  }
}

export const hasFile = {
  name: 'hasFile',
  title: 'Fil',
  type: 'array',
  of: [
    { type: 'DigitalObject.File' },
  ],
  options: {
    semanticSanity: {
      '@type': 'list'
    }
  }
}

export const fileSingleton = {
  name: 'hasFile',
  title: 'Fil',
  type: 'DigitalObject.File',
  options: {
    semanticSanity: {
      '@type': '@id'
    }
  },
}

export const image = {
  name: 'image',
  title: 'Thumbnail',
  description: (
    <span>
      Last opp eller velg et bilde. Dette er bildet som brukes som forhåndsvisning.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#image'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    { type: 'DigitalObject.Image' },
  ],
  options: {
    layout: 'grid',
    semanticSanity: {
      '@type': '@json'
    }
  }
}

export const imageSingleton = {
  name: 'image',
  title: 'Thumbnail',
  description: (
    <span>
      Last opp eller velg et bilde. Dette er bildet som brukes som forhåndsvisning.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#image'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'DigitalObject.Image',
  options: {
    semanticSanity: {
      '@type': '@json'
    }
  },
}

export const logo = {
  name: 'logo',
  title: 'Logo',
  description: (
    <span>
      Last opp eller velg et bilde. Dette er bildet som brukes som forhåndsvisning.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#image'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'DigitalObject.Image',
  options: {
    semanticSanity: {
      '@type': '@json'
    }
  },
}

export const digitallyShownBy = {
  name: 'digitallyShownBy',
  title: 'Digitale bilder',
  description: 'For objekt med flere bilder, blad, versjoner eller sider av objektet. Bruk "hovedrepresentasjon" til forhåndsvisning.',
  fieldset: 'representation',
  type: 'array',
  of: [
    { type: 'DigitalObject.Image' },
  ],
  options: {
    hotspot: true,
    layout: 'grid',
    semanticSanity: {
      '@type': '@json'
    }
  }
}

export const subjectOfManifest = {
  name: 'subjectOfManifest',
  title: 'Hovedmanifest',
  type: 'url',
  description: (
    <span>
      Hovedmanifestet til objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#main-representation'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
}

export const preferredIdentifier = {
  name: 'preferredIdentifier',
  title: 'Foretrukket identifikator',
  description: (
    <span>
      Identifikatoren som er gjeldende for dette objektet. Alternative, eksterne eller ugyldige
      identifikatorer kan registreres i <i>Identifiert av </i>.{' '}
      <Link
        target="blank"
        href={'https://muna.xyz/docs/model/properties#preferred-identifier'}
      >
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'string',
  validation: (Rule) =>
    Rule.required().custom(async (prefId) => {
      const docs = await client.fetch(
        `*[preferredIdentifier == "${prefId}" && !(_id in path("drafts.**"))] { preferredIdentifier }`,
        { prefId },
      )
      return docs.length > 1 ? 'Value is not unique' : true
    }),
}

export const label = {
  name: 'label',
  title: 'Tittel',
  type: 'LocaleString',
  validation: (Rule) => Rule.required(),
  options: {
    semanticSanity: {
      '@id': 'rdfs:label',
      '@container': '@language'
    }
  },
}
export const sortLabel = {
  name: 'sortLabel',
  title: 'Invertert form (sortering)',
  type: 'string',
  options: {
    semanticSanity: {
      '@id': 'muna:sortLabel',
    }
  },
}

export const labelSingleton = {
  name: 'label',
  title: 'Tittel',
  type: 'string',
  validation: (Rule) => Rule.required(),
  options: {
    semanticSanity: {
      '@id': 'rdfs:label'
    }
  },
}

/**
 * Identified by
 * P1_is_identified_by
 */

export const identifiedBy = {
  name: 'identifiedBy',
  title: 'Identifisert av',
  description: 'Legg til titler, navn eller identifikatorer.',
  type: 'array',
  of: [
    { type: 'Name' },
    { type: 'Identifier' }
  ],
  options: {
    modal: 'popup',
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

/**
 * License
 * dct:license
 */

export const license = {
  name: 'license',
  title: 'Lisensiering',
  description: 'Velg den korrekt lisensen eller rettighetserklæringen.',
  type: 'string',
  options: {
    list: licenseTypes,
  },
  validation: (Rule) => Rule.required(),
}

export const subject = {
  name: 'subject',
  title: 'Emne',
  description: (
    <span>
      Emneord knyttet til dette objektet. Legg til{' '}
      <Link target="blank" href={'/desk/steder'}>
        nye emneord
      </Link>
      .{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#subject'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'Concept' }],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const referredToBy = {
  name: 'referredToBy',
  title: 'Beskrivelse',
  description: (
    <span>
      Objektet kan ha mange beskrivelser, korte og/eller lange. Tekstene kan types for ulike
      bruksformål.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#description'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    { type: 'LinguisticObject' },
  ],
  options: {
    modal: 'fullscreen',
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const relation = {
  name: 'relation',
  title: 'Relasjon',
  description: 'Uspesifisert relasjon til en annen ting',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Actor' },
        { type: 'Event' },
        { type: 'Activity' },
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const subGroupOf = {
  name: 'subGroupOf',
  title: 'Undergruppe av',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Group' },
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const presentAt = {
  name: 'presentAt',
  title: 'Var tilstede ved',
  description: (
    <span>
      Dette objektet var tilstede ved en hendelse eller aktivitet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#present-at'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Event' },
        { type: 'Activity' }
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const motivatedBy = {
  name: 'motivatedBy',
  title: 'Motivert av',
  description: (
    <span>
      Dette objektet var tilstede ved en hendelse eller aktivitet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#motivated-by'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Event' },
        { type: 'Activity' }
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const hasCurrentOwner = {
  name: 'hasCurrentOwner',
  title: 'Nåværende eier',
  description: (
    <span>
      Nåværende eier av dette objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#current-owner'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' },
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

export const hasFormerOrCurrentOwner = {
  name: 'hasFormerOrCurrentOwner',
  title: 'Tidligere eller nåværende eier',
  title: 'Former or current owner',
  description: (
    <span>
      Tidligere eller nåværende eier av dette objektet. Brukes også for usikkert eierskap.{' '}
      <Link
        target="blank"
        href={'https://muna.xyz/docs/model/properties#former-or-current-owner'}
      >
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' },
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

export const composedOf = {
  name: 'composedOf',
  title: 'Består av',
  description: (
    <span>
      Andre identifiserte objekt som er en del av dette objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#composed-of'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' }
      ]
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

export const dissolved = {
  name: 'dissolved',
  title: 'Oppløsning',
  description: 'Group that was dissolved.',
  type: 'reference',
  to: [
    { type: 'Group' }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const formed = {
  name: 'formed',
  title: 'Opprettelse',
  description: 'Group that was formed.',
  type: 'reference',
  to: [
    { type: 'Group' },
    { type: 'Project' },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const formedFrom = {
  name: 'formedFrom',
  title: 'Opprettet fra',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Group' },
        { type: 'Project' },
      ],
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const joinedWith = {
  name: 'joinedWith',
  title: 'Innlemmet i gruppe',
  description: 'Group that actor(s) joined with',
  type: 'reference',
  to: [
    { type: 'Group' },
    { type: 'Project' },
    { type: 'Product' },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const joined = {
  name: 'joined',
  title: 'Innlemmet aktør(er)',
  description: 'Actor(s) that joined this group',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' },
        { type: 'Group' },
      ]
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const transferred = {
  name: 'transferred',
  title: 'Overførte',
  description: 'Hvem ble overført?',
  type: 'reference',
  to: [
    { type: 'Actor' },
    { type: 'Group' },
    { type: 'Project' },
    { type: 'Product' },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const transferredTo = {
  name: 'transferredTo',
  title: 'Overført til',
  description: 'Group that actor(s) transfered to',
  type: 'reference',
  to: [
    { type: 'Group' },
    { type: 'Project' },
    { type: 'Product' },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const transferredFrom = {
  name: 'transferredFrom',
  title: 'Overført fra',
  description: 'Overført fra',
  type: 'reference',
  to: [
    { type: 'Group' },
    { type: 'Project' },
    { type: 'Product' },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const separatedFrom = {
  name: 'separatedFrom',
  title: 'Utmeldt fra',
  description: 'Group that lost member',
  type: 'reference',
  to: [
    { type: 'Group' },
    { type: 'Project' },
    { type: 'Product' },
  ],
  validation: (Rule) => Rule.required(),
}

export const separated = {
  name: 'separated',
  title: 'Hvem meldte seg ut?',
  description: 'Actor(s) that left this group',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' }
      ],
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const birthOf = {
  name: 'birthOf',
  title: 'Døden til',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' },
      ],
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const deathOf = {
  name: 'deathOf',
  title: 'Døden til',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' },
      ],
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
  validation: (Rule) => Rule.required(),
}

export const broughtIntoExistence = {
  name: 'broughtIntoExistence',
  title: 'Starten på',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Project' },
        { type: 'Product' },
        { type: 'Service' },
        { type: 'Endpoint' }
      ],
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  }
}

export const tookOutOfExistence = {
  name: 'tookOutOfExistence',
  title: 'Slutten på',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Project' },
        { type: 'Product' },
        { type: 'Service' },
        { type: 'Endpoint' }
      ],
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  }
}

export const competence = {
  name: 'competence',
  title: 'Kompetanse',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'CompetenceType' }] }]
}

export const competenceSingleton = {
  name: 'competence',
  title: 'Kompetanse',
  type: 'reference',
  to: [{ type: 'CompetenceType' }]
}

export const availability = {
  name: 'availability',
  title: 'Tilgjengelighet',
  type: 'reference', to: [{ type: 'AvailabilityType' }]
}

export const condidionOfUse = {
  name: 'conditionOfUse',
  title: 'Bruksvilkår',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'ConditionOfUseType' }] }]
}

export const programmedWith = {
  name: 'programmedWith',
  title: 'Programmert med',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'ProgrammingLanguage' }]
    }
  ]
}

export const serviceDescription = {
  name: 'serviceDescription',
  title: 'Service description',
  type: 'url',
}

export const url = {
  name: 'url',
  title: 'Url',
  type: 'url',
}

export const homepage = {
  name: 'homepage',
  title: 'Hjemmeside',
  description: 'Hjemmeside til ressursen',
  type: 'url',
}

export const link = {
  name: 'link',
  title: 'Links',
  type: 'array',
  of: [{
    type: 'WebResource'
  }]
}

export const usedService = {
  name: 'usedService',
  title: 'Benytter tjeneste',
  type: 'array',
  of: [
    { type: 'ServiceUsageAssignment' }
  ]
}

export const continued = {
  name: 'continued',
  title: 'Continued',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Project' },
      { type: 'Activity' }
    ]
  }]
}

export const continuedBy = {
  name: 'continuedBy',
  title: 'Continued by',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Project' },
      { type: 'Activity' }
    ]
  }]
}

export const servesDataset = {
  name: 'servesDataset',
  title: 'Leverer datasett',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Dataset' }
    ]
  }]
}

export const composedOfProducts = {
  name: 'composedOf',
  title: 'Består av',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Product' }
    ]
  }]
}

export const endpoint = {
  name: 'endpoint',
  title: 'Endpoints',
  description: 'Endpoint denne tjenesten eksponerer.',
  type: 'array',
  of: [{
    type: 'reference',
    to: [
      { type: 'Endpoint' }
    ]
  }]
}

export const usedPlatform = {
  name: 'usedPlatform',
  title: 'Used platform',
  type: 'array',
  of: [
    { type: 'PlatformUsageAssignment' }
  ]
}

export const as = {
  name: 'as',
  title: 'I rollen som',
  type: 'reference',
  to: [
    { type: 'Role' }
  ]
}

export const totalHours = {
  name: 'totalHours',
  title: 'totalHours',
  type: 'number',
}

export const subjectOf = {
  name: 'subjectOf',
  title: 'Omhandlet i',
  description: (
    <span>
      <strong>Eksperimentel:</strong> Tekster om dette objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#subject-of'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'LinguisticDocument' }],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

export const depicts = {
  name: 'depicts',
  title: 'Avbilder',
  description: (
    <span>
      Avbildet på dette objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#depicts'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Actor' },
        { type: 'Concept' }
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const represents = {
  name: 'represents',
  title: 'Representerer',
  description: (
    <span>
      Hva dette motivet representerer.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#represents'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Actor' },
        { type: 'Concept' }
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const showsVisualObject = {
  name: 'showsVisualObject',
  title: 'Viser merke eller bilde',
  description: (
    <span>
      Motiv vist på dette objectet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#shown-visual-item'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'VisualObject' }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const carries = {
  name: 'carries',
  title: 'Bærer verk',
  description: (
    <span>
      Verk som er representert i dette objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#carries'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'Work' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const measuredBy = {
  name: 'measurement',
  title: 'Måling',
  description: (
    <span>
      <strong>Eksperimentel:</strong> Måling av objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#measurement'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'Measurement' }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const hasDimension = {
  name: 'hasDimension',
  title: 'Har dimension',
  description: (
    <span>
      <strong>Eksperimentel:</strong> Objektets dimension.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#dimension'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'Dimension' }],
  options: {
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

export const consistsOf = {
  name: 'consistsOf',
  title: 'Laget av',
  description: (
    <span>
      Hvilket material objektet er laget av, for eksempel lær og/eller pergament. Legg til{' '}
      <Link target="blank" href={'/desk/typer;material'}>
        nytt material
      </Link>
      .{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#consists-of'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'Material' }],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  },
}

export const usedGeneralTechnique = {
  name: 'usedGeneralTechnique',
  title: 'Brukte generell teknikk',
  description: (
    <span>
      Teknikker eller metoder brukt i aktiviteten. Legg til{' '}
      <Link target="blank" href={'/desk/typer;technique'}>
        ny teknikk
      </Link>
      .{' '}
      <Link
        target="blank"
        href={'https://muna.xyz/docs/model/properties#used-general-technique'}
      >
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'Technique' }],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const usedSpecificTechnique = {
  name: 'usedSpecificTechnique',
  title: 'Brukte spesifikk teknikk',
  description: (
    <span>
      Spesifikk teknikk brukt i aktiviteten. Legg til{' '}
      <Link target="blank" href={'/desk/samlingsadministrasjon;designOrProcedure'}>
        ny tekniskbeskrivelse
      </Link>
      .{' '}
      <Link
        target="blank"
        href={'https://muna.xyz/docs/model/properties#used-spesific-technique'}
      >
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'DesignOrProcedure' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const usedObjectOfType = {
  name: 'usedObjectOfType',
  title: 'Brukte objekt av type',
  description: (
    <span>
      Objekttype som ble brukt i aktiviteten. Legg til{' '}
      <Link target="blank" href={'/desk/typer;objectType'}>
        ny objekttype
      </Link>
      .{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#used-object-of-type'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'ObjectType' }],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const usedSpecificObject = {
  name: 'usedSpecificObject',
  title: 'Brukte spesifikt objekt',
  description: (
    <span>
      Objekt som ble brukt i aktiviteten. Legg til{' '}
      <Link target="blank" href={'/desk/objekt'}>
        nytt objekt
      </Link>
      .{' '}
      <Link
        target="blank"
        href={'https://muna.xyz/docs/model/properties#used-spesific-object'}
      >
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'HumanMadeObject' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const timespan = {
  name: 'timespan',
  title: 'Tidsspenn',
  type: 'Timespan',
}

export const timespanSingleton = {
  name: 'timespan',
  title: 'Tidsspenn',
  type: 'Timespan',
}

export const contributionAssignedBy = {
  name: 'contributionAssignedBy',
  title: 'Utført av',
  type: 'array',
  of: [
    { type: 'ContributionAssignment' }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const carriedOutBy = {
  name: 'carriedOutBy',
  title: 'Utført av',
  type: 'array',
  of: [{ type: 'ContributionAssignment' }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const hadParticipant = {
  name: 'hadParticipant',
  title: 'Hadde medvirkende',
  type: 'array',
  of: [{ type: 'ContributionAssignment' }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const tookPlaceAt = {
  name: 'tookPlaceAt',
  title: 'Skjedde ved',
  description: (
    <span>
      Hvor skjedde dette? Legg til{' '}
      <Link target="blank" href={'/desk/steder'}>
        nytt sted
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'Place' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

/**
 * skos:altLabel
 */
export const altLabel = {
  name: 'altLabel',
  title: 'Alternativt navn',
  type: 'LocaleString',
  options: {
    semanticSanity: {
      '@container': '@language',
    }
  },
}

/**
 * P35_has_identified
 */
export const hasIdentified = {
  name: 'hasIdentified',
  title: 'Identifiserte tilstander',
  type: 'array',
  of: [{ type: 'ConditionState' }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const valueSlider = {
  name: 'value',
  title: 'Verdi',
  description: '1 is horrible, 100 is MINT!',
  type: 'number',
  options: {
    layout: 'slider',
    range: { min: 1, max: 100, step: 1 },
  },
}

export const language = {
  name: 'language',
  title: 'Språk',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'Language' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const memberOf = {
  name: 'memberOf',
  title: 'Medlem av',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' }
      ],
      options: {
        filter: '_type == "Actor" && references($id)',
        filterParams: { id: 'd4ad3e47-1498-4b95-9b7f-c25be386691a' }
      }
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

/**
 * hasMember
 * la:has_member
 */
export const hasMember = {
  name: 'hasMember',
  title: 'Har medlem',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'HumanMadeObject' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const hasTeam = {
  name: 'hasTeam',
  title: 'Har team',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'Group' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const definedByGeoJSON = {
  name: 'definedByGeoJSON',
  title: 'GeoJSON',
  description: 'Lag et GeoJSON objekt eller lim inn en hel GeoJSON fil.',
  type: 'array',
  of: [
    { type: 'GeojsonFeatureCollection' },
    { type: 'Geojson' }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const transferredTitleTo = {
  name: 'transferredTitleTo',
  title: 'Overførte tittel til',
  description: '',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' }
      ]
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const transferredTitleFrom = {
  name: 'transferredTitleFrom',
  title: 'Overførte tittel fra',
  description: '',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'Actor' }
      ]
    }
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const transferredTitleOf = {
  name: 'transferredTitleOf',
  title: 'Overførte tittel',
  description: '',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Collection' }
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const concerned = {
  name: 'concerned',
  title: 'Omhandler',
  description: 'Which collection(s) or object(s) is this an assessment of.',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Collection' }
      ],
    },
  ],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const motivated = {
  name: 'motivated',
  title: 'Motiverte',
  type: 'array',
  of: [{ type: 'Treatment' }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
}

export const featured = {
  name: 'featured',
  title: 'Fremhevet?',
  type: 'boolean',
  initialValue: false,
  options: {
    semanticSanity: {
      "@type": "xsd:boolean"
    }
  },
}

export const wasOutputOf = {
  name: 'wasOutputOf',
  title: 'Was output of',
  type: 'DataTransferEvent',
  hidden: true,
  options: {
    semanticSanity: {
      '@type': '@json'
    }
  },
}

export const inDataset = {
  name: 'inDataset',
  title: 'I datasett',
  type: 'Dataset',
  options: {
    semanticSanity: {
      '@type': '@id'
    }
  },
}

export const shortDescription = {
  name: 'shortDescription',
  title: 'Kort beskrivelse',
  description: 'En setning som beskriver denne tingen. For eksempel en persons livsrolle, virkested og leveår.',
  type: 'string',
  validation: (Rule) => Rule.max(100).warning('Korte og konsise beskrivelser er best!'),
}