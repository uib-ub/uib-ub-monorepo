import { getLanguage } from './getLanguage';
import omitEmptyEs from 'omit-empty-es';


export const constructIdentifiers = (data: any) => {
  const { _label, identifier, previousIdentifier } = data;

  if (!identifier && !previousIdentifier && !_label) return data;

  delete data.title;
  delete data.identifier;
  delete data.previousIdentifier;

  const previous = {
    _label: `${previousIdentifier}`,
    type: 'Identifier',
    classified_as: [
      {
        id: "https://vocab.getty.edu/aat/300312355",
        type: "Type",
        _label: "Accession Number"
      },
      {
        id: "https://vocab.getty.edu/aat/300449151",
        type: "Type",
        _label: "Historical terms"
      },
    ],
    content: previousIdentifier,
  };

  const id = {
    _label: `${identifier}`,
    type: 'Identifier',
    classified_as: [
      {
        id: "https://vocab.getty.edu/aat/300404620",
        type: "Type",
        _label: "Catalog numbers"
      },
      {
        id: "https://vocab.getty.edu/aat/300404670",
        type: "Type",
        _label: "Preferred terms"
      }
    ],
    content: identifier,
  };

  let names: any[] = [];
  if (_label) {
    names = Object.entries(_label).map(([key, value]: [string, any]) => {
      return {
        type: "Name",
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300404670",
            type: "Type",
            _label: "Primary Name"
          },
          (value as string[])[0].includes('[', 0) ? {
            id: "https://vocab.getty.edu/aat/300417205",
            type: "Type",
            _label: "Constructed titles"
          } : undefined,
        ],
        content: value[0],
        language: [
          getLanguage(key)
        ]
      };
    });
  }

  delete data.previousIdentifier;

  return omitEmptyEs({
    ...data,
    identified_by: [
      ...names,
      identifier ? id : undefined,
      previousIdentifier ? previous : undefined,
    ],
  });
};
