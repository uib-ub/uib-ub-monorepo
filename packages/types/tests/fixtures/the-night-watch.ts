import type { HumanMadeObjectSchema, PlaceSchema } from '../../src/index';

export const TheNightWatch: HumanMadeObjectSchema = {
  '@context': ['https://linked.art/ns/v1/linked-art.json'],
  type: 'HumanMadeObject',
  _label: 'The Night Watch',
  id: 'https://www.rijksmuseum.nl/nl/collectie/SK-C-5',
  identified_by: [
    {
      type: 'Name',
      content: 'The Night Watch',
    },
    {
      type: 'Identifier',
      content: 'SK-C-5',
    }
  ],
  produced_by: {
    id: 'sk-c-5-production',
    type: 'Production',
    _label: 'Rembrandt',
    carried_out_by: [
      {
        id: 'rembrandt',
        type: 'Person',
        _label: 'Rembrandt',
      }
    ],
    took_place_at: [
      {
        id: 'https://www.geonames.org/2759794',
        type: 'Place',
        _label: 'Amsterdam',
      }
    ],
    technique: [
      {
        id: 'painting',
        type: 'Type',
        _label: 'painting',
      }
    ]
  }
}

export const Amsterdam: PlaceSchema = {
  '@context': ['https://linked.art/ns/v1/linked-art.json'],
  type: 'Place',
  _label: 'Amsterdam',
  id: 'https://www.geonames.org/2759794',
  identified_by: [
    {
      type: 'Name',
      content: 'Amsterdam',
      language: [
        {
          id: 'en',
          type: 'Language',
          _label: 'English',
        }
      ],
    },
    {
      type: 'Name',
      content: 'アムステルダム',
      language: [
        {
          id: 'jp',
          type: 'Language',
          _label: 'Japanese',
        }
      ],
    },
    {
      type: 'Identifier',
      content: '2759794',
    }
  ],
}
