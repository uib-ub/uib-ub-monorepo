import omitEmptyEs from 'omit-empty-es';
import { getLanguage } from '../../getLanguage';
import { aatAlternativeTitlesType, aatConstructedTitlesType, aatFirstNameType, aatHistoricalTermsType, aatIsbnType, aatLastNameType, aatPreferredTermsType, aatPrimaryNameType } from '../../staticMapping';

export const constructIdentifiers = (data: any) => {
  const {
    _label,
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
    isbn,
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
    !isbn
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
  delete data.isbn;

  let names: any[] = [];
  let previousArray: any[] = [];
  let bibsysArray: any[] = [];
  let viafArray: any[] = [];

  const isbnArray = [{
    _label: `${isbn}`,
    type: 'Identifier',
    classified_as: [
      aatIsbnType,
    ],
    content: isbn,
  }];

  if (previousIdentifier) {
    previousArray = [{
      _label: `${previousIdentifier}`,
      type: 'Identifier',
      classified_as: [
        aatHistoricalTermsType,
      ],
      content: previousIdentifier,
    }];
  }

  if (bibsysID) {
    bibsysArray = bibsysArray.map((id: string) => {
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
    _label: `${identifier}`,
    type: 'Identifier',
    classified_as: [
      aatPreferredTermsType,
    ],
    content: identifier,
  }];

  if (name) {
    names = [
      {
        type: "Name",
        classified_as: [
          aatPrimaryNameType,
          (Array.isArray(name) ? name[0] : name).includes('[', 0) ? aatConstructedTitlesType : undefined,
        ],
        content: Array.isArray(name) ? name[0] : name,
        language: [
          getLanguage('no')
        ],
        part: [
          (firstName ? {
            type: "Name",
            classified_as: [
              aatFirstNameType,
            ],
            content: Array.isArray(firstName) ? firstName[0] : firstName,
          } : undefined),
          (familyName ? {
            type: "Name",
            classified_as: [
              aatLastNameType,
            ],
            content: Array.isArray(familyName) ? familyName[0] : familyName,
          } : undefined)
        ],
      },
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
      }))[0] : []),
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
      }))[0] : []),
    ];
  }

  delete data.previousIdentifier;

  return omitEmptyEs({
    ...data,
    identified_by: [
      ...names,
      ...id,
      ...previousArray,
      ...bibsysArray,
      ...viafArray,
      ...isbnArray,
    ],
  });
};
