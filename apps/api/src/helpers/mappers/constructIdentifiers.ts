import { getLanguage } from './getLanguage';
import omitEmptyEs from 'omit-empty-es';


export const constructIdentifiers = (data: any) => {
  const { _label, alternative, identifier, previousIdentifier, bibsysID, hasBeenMergedWith, isbn } = data;

  if (!_label && !alternative && !identifier && !previousIdentifier && !bibsysID && !hasBeenMergedWith && !isbn) return data;

  delete data.title;
  delete data.alternative;
  delete data.identifier;
  delete data.previousIdentifier;
  delete data.bibsysID;
  delete data.hasBeenMergedWith;
  delete data.isbn;

  let names: any[] = [];

  const previous = [{
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
  }];

  const bibsys = [{
    _label: `${bibsysID}`,
    type: 'Identifier',
    classified_as: [
      {
        id: "https://vocab.getty.edu/aat/300449151",
        type: "Type",
        _label: "Historical terms"
      },
    ],
    content: bibsysID,
  }];

  const isbnArray = [{
    _label: `${isbn}`,
    type: 'Identifier',
    classified_as: [
      {
        id: "https://vocab.getty.edu/aat/300417443",
        type: "Type",
        _label: "ISBN"
      },
    ],
    content: isbn,
  }];

  const id = [{
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
  }];

  if (_label) {
    names = [
      ...Object.entries(_label).map(([key, value]: [string, any]) => {
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
      }),
      ...(alternative ? (Object.entries(alternative).map(([key, value]: [string, any]) => {
        return {
          type: "Name",
          classified_as: [
            {
              id: "https://vocab.getty.edu/aat/300417226",
              type: "Type",
              _label: "Alternative titles"
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
      })) : []),
    ];
  }

  delete data.previousIdentifier;

  return omitEmptyEs({
    ...data,
    identified_by: [
      ...names,
      ...id,
      ...(previousIdentifier ? previous : []),
      ...(isbn ? isbnArray : []),
      ...(bibsysID ? bibsys : []),
    ],
  });
};
