import omitEmptyEs from 'omit-empty-es';
import { mapToGeneralClass } from '../mapToGeneralClass';
import { getLanguage } from './getLanguage';
import { classToAttMapping } from '../classToHasType';

export const constructAboutness = (data: any) => {
  const { hasType, description, physicalDescription, physicalCondition, pages, isReferencedBy, subject, spatial, shows = [], dimension = [] } = data;

  const type = mapToGeneralClass(hasType)

  if (!hasType && !description && !physicalDescription && !physicalCondition && !pages && !isReferencedBy && !subject && !spatial && shows.lenght > 0 && dimension.lenght > 0) return data;

  delete data.hasType
  delete data.description
  delete data.physicalDescription
  delete data.physicalCondition
  delete data.pages
  delete data.isReferencedBy
  delete data.subject
  delete data.spatial

  let isReferencedByArray: any[] = [];
  let descriptionArray: any[] = [];
  let physicalDescriptionArray: any[] = [];
  let physicalConditionArray: any[] = [];
  let showsConceptArray: any[] = [];
  let showsSpatialArray: any[] = [];
  let aboutArray: any[] = [];
  let pagesArray: any[] = [];

  if (isReferencedBy) {
    isReferencedByArray = isReferencedBy.map((reference: any) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          {
            id: "http://fix.me",
            type: "Type",
            _label: "Short reference",
          }
        ],
        language: [
          getLanguage(reference._label)
        ],
        _label: reference._label,
        content: reference.description.no[0],
      }
    });
  }

  if (description) {
    descriptionArray = Object.entries(description).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300435416",
            type: "Type",
            _label: "Description",
          }
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (physicalDescription) {
    physicalDescriptionArray = Object.entries(physicalDescription).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          {
            id: "https://vocab.getty.edu/aat/300435452",
            type: "Type",
            _label: "Physical description",
          }
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (physicalCondition) {
    physicalConditionArray = Object.entries(physicalCondition).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          {
            id: "https://vocab.getty.edu/aat/300435425",
            type: "Type",
            _label: "Condition/examination description",
          }
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (subject && type !== "Text") {
    showsConceptArray = subject.map((concept: any) => {
      return {
        type: "VisualItem",
        about: [
          {
            id: concept.id,
            type: "Type",
            _label: concept._label
          }

        ]
      }
    });
  }

  if (spatial && type !== "Text") {
    showsSpatialArray = spatial.map((concept: any) => {
      return {
        type: "VisualItem",
        about: [
          {
            id: concept.id,
            type: "Place",
            _label: concept._label
          }

        ]
      }
    });
  }

  if (subject && type === "Text") {
    aboutArray = subject.map((concept: any) => {
      return {
        id: concept.id,
        type: "Type",
        _label: concept._label
      }
    });
  }

  const classified_as = [
    {
      id: classToAttMapping[hasType]?.mapping ?? "https://fix.me",
      type: "Type",
      _label: hasType,
    }
  ];

  if (pages) {
    pagesArray = [{
      type: "Dimension",
      _label: pages,
      classified_as: [
        {
          id: "http://vocab.getty.edu/aat/300404433",
          type: "Type",
          _label: "Count Of"
        }
      ],
      value: parseInt(pages),
      unit: {
        id: "http://vocab.getty.edu/aat/300194222",
        type: "MeasurementUnit",
        _label: "Pages"
      }
    }]
  }

  return omitEmptyEs({
    ...data,
    classified_as,
    referred_to_by: [
      ...descriptionArray,
      ...isReferencedByArray,
      ...physicalDescriptionArray,
      ...physicalConditionArray,
    ],
    shows: [
      ...shows,
      ...showsConceptArray,
      ...showsSpatialArray,
    ],
    dimension: [
      ...dimension,
      ...pagesArray,
    ],
    ...(aboutArray ? { about: aboutArray } : undefined),
  });
}
