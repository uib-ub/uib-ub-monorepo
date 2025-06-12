import { getLanguage } from '../getLanguage';
import { aatAlternativeTitlesType, aatBirthNameType, aatConstructedTitlesType, aatFirstNameType, aatHistoricalTermsType, aatIsbnType, aatLastNameType, aatPreferredTermsType, aatPrefixesType, aatPrimaryNameType, aatPseudonymsType, aatSuffixesType, uibVolumeNumberType } from '../staticMapping';
import omitEmptyEs from 'omit-empty-es';

export const constructIdentifiers = (data: any) => {
  const {
    _label,
    title,
    alternative,
    altLabel,
    identifier,
    previousIdentifier,
    bibsysID,
    viafID,
    hasBeenMergedWith,
    name,
    firstName,
    familyName,
    birthName,
    pseudonym,
    isbn,
    honorificPrefix,
    'schema:honorificPrefix': schemaHonorificPrefix,
    honorificSuffix,
    'schema:honorificSuffix': schemaHonorificSuffix,
    volume,
  } = data;

  if (
    !_label &&
    !alternative &&
    !altLabel &&
    !identifier &&
    !previousIdentifier &&
    !bibsysID &&
    !viafID &&
    !hasBeenMergedWith &&
    !name &&
    !firstName &&
    !familyName &&
    !birthName &&
    !pseudonym &&
    !honorificPrefix &&
    !schemaHonorificPrefix &&
    !honorificSuffix &&
    !schemaHonorificSuffix &&
    !isbn &&
    !title &&
    !volume
  ) {
    return data;
  }

  delete data.title;
  delete data.alternative;
  delete data.altLabel;
  delete data.hiddenLabel
  delete data.identifier;
  delete data.previousIdentifier;
  delete data.bibsysID;
  delete data.viafID;
  delete data.hasBeenMergedWith;
  delete data.name;
  delete data.firstName;
  delete data.familyName;
  delete data.birthName;
  delete data.pseudonym;
  delete data.honorificPrefix;
  delete data.honorificSuffix;
  delete data.isbn;
  delete data['schema:honorificPrefix'];
  delete data['schema:honorificSuffix'];

  if (volume && data.hasType.includes('Article')) {
    delete data.volume;
  }

  let names: any[] = [];
  let titles: any[] = [];
  let previousArray: any[] = [];
  let bibsysArray: any[] = [];
  let viafArray: any[] = [];
  let isbnArray: any[] = [];
  let volumeArray: any[] = [];

  if (isbn) {
    isbnArray = [{
      _label: `${isbn}`,
      type: 'Identifier',
      classified_as: [
        aatIsbnType,
      ],
      content: isbn,
    }];
  }

  if (previousIdentifier) {
    previousArray = [{
      _label: `${previousIdentifier}`,
      type: 'Identifier',
      classified_as: [
        aatHistoricalTermsType,
      ],
      content: Array.isArray(previousIdentifier) ? previousIdentifier.join(', ') : previousIdentifier,
    }];
  }

  if (bibsysID) {
    bibsysArray = bibsysID.map((id: string) => {
      return {
        _label: `${id}`,
        type: 'Identifier',
        classified_as: [
          aatHistoricalTermsType,
        ],
        content: id,
      }
    })
  }

  if (viafID) {
    viafArray = viafID.map((id: string) => {
      return {
        _label: `${id}`,
        type: 'Identifier',
        classified_as: [
          aatHistoricalTermsType,
        ],
        content: id,
      };
    })
  }

  const id = [{
    type: 'Identifier',
    classified_as: [
      aatPreferredTermsType,
    ],
    content: identifier,
  }];

  if (volume && !data.hasType.includes('Article')) {
    volumeArray = [
      {
        type: "Identifier",
        classified_as: [
          uibVolumeNumberType,
        ],
        content: volume,
      }
    ]
  }

  if (name) {
    names = [
      {
        type: "Name",
        classified_as: [
          aatPrimaryNameType,
          (Array.isArray(name) ? (typeof name[0] === 'string' ? name[0] : name[0]['@value']) : name).includes('[', 0) ? aatConstructedTitlesType : undefined,
        ],
        content: Array.isArray(name) ? (typeof name[0] === 'string' ? name[0] : name[0]['@value']) : (typeof name === 'string' ? name : name['@value']),
        language: [
          Array.isArray(name) && typeof name[0] === 'object' && name[0]['@language']
            ? getLanguage(name[0]['@language'])
            : getLanguage('no')
        ],
        part: [
          (honorificPrefix || schemaHonorificPrefix ? {
            type: "Name",
            classified_as: [
              aatPrefixesType,
            ],
            content: honorificPrefix || schemaHonorificPrefix,
          } : undefined),
          (firstName ? {
            type: "Name",
            classified_as: [
              aatFirstNameType,
            ],
            content: Array.isArray(firstName) ? (typeof firstName[0] === 'string' ? firstName[0] : firstName[0]['@value']) : (typeof firstName === 'string' ? firstName : firstName['@value']),
          } : undefined),
          (familyName ? {
            type: "Name",
            classified_as: [
              aatLastNameType,
            ],
            content: Array.isArray(familyName) ? (typeof familyName[0] === 'string' ? familyName[0] : familyName[0]['@value']) : (typeof familyName === 'string' ? familyName : familyName['@value']),
          } : undefined),
          (honorificSuffix || schemaHonorificSuffix ? {
            type: "Name",
            classified_as: [
              aatSuffixesType,
            ],
            content: honorificSuffix || schemaHonorificSuffix,
          } : undefined),
        ],
      },
      (birthName ? {
        type: "Name",
        classified_as: [
          aatBirthNameType,
        ],
        content: birthName,
      } : undefined),
      ...(pseudonym ? pseudonym.map((p: string) => ({
        type: "Name",
        classified_as: [
          aatPseudonymsType,
        ],
        content: p,
      })) : [])
    ]
  }

  titles = [
    ...(title ? (Object.entries(title).map(([key, value]: [string, any]) => {
      return value.map((val: string) => {
        return {
          type: "Name",
          classified_as: [
            aatPrimaryNameType,
            val.includes('[', 0) ? aatConstructedTitlesType : undefined,
          ],
          content: val,
          language: [
            getLanguage(key)
          ]
        };
      })
    })).flatMap((x: any) => x) : []),
    ...(!title && data.type.includes('HumanMadeObject') ? [
      {
        type: "Name",
        classified_as: [
          aatPrimaryNameType,
          aatConstructedTitlesType,
        ],
        content: `Uten tittel (${identifier})`,
        language: [
          getLanguage('no')
        ]
      },
      {
        type: "Name",
        classified_as: [
          aatPrimaryNameType,
          aatConstructedTitlesType,
        ],
        content: `Missing title (${identifier})`,
        language: [
          getLanguage('en')
        ]
      },
    ] : []),
    ...(alternative ? (Object.entries(alternative).map(([key, value]: [string, any]) => {
      return value.map((val: string) => {
        return {
          type: "Name",
          classified_as: [
            aatAlternativeTitlesType,
            val.includes('[', 0) ? aatConstructedTitlesType : undefined,
          ],
          content: val,
          language: [
            getLanguage(key)
          ]
        };
      })
    })).flatMap((x: any) => x) : []),
    ...(altLabel ? (Object.entries(altLabel).map(([key, value]: [string, any]) => {
      return value.map((val: string) => {
        return {
          type: "Name",
          classified_as: [
            aatAlternativeTitlesType,
            val.includes('[', 0) ? aatConstructedTitlesType : undefined,
          ],
          content: val,
          language: [
            getLanguage(key)
          ]
        };
      })
    })).flatMap((x: any) => x) : []),
  ];

  return omitEmptyEs({
    ...data,
    identified_by: [
      ...names,
      ...titles,
      ...id,
      ...previousArray,
      ...bibsysArray,
      ...viafArray,
      ...isbnArray,
      ...volumeArray,
    ],
  });
};
