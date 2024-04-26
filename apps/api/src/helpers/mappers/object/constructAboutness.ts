import omitEmptyEs from 'omit-empty-es';
import { Publication, mapToGeneralClass } from '../mapToGeneralClass';
import { getLanguage } from '../getLanguage';
import { classToAttMapping } from '../mapClassToClassifiedAs';
import { DOMAIN } from '../../../config/constants';
import { randomUUID } from 'crypto';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { aatAbstractsType, aatDescriptionsType, aatInternalNoteType, aatPhysicalConditionsType, aatPhysicalDescriptionType, aatProvenanceStatementsType, aatRelatedTextualReferencesType } from '../staticMapping';
import { isEqual } from 'lodash';
import { getTimespan } from '../constructTimespan';


export const constructAboutness = async (data: any) => {
  const {
    hasType,
    description,
    physicalDescription,
    physicalCondition,
    isReferencedBy,
    subject,
    spatial,
    depicts,
    producedIn,
    internalNote,
    hasTranscription,
    provenance,
    reference,
    typeOfDamage,
    abstract,
    language,
    placeOfPublication,
    publishedYear,
    publisher,
    issued,
    editor,
    hasVersion,
    originalCreator,
  } = data;

  const type = mapToGeneralClass(hasType)
  const isPublication = Publication.includes(hasType);

  /**
   * Encodes the versions based on the provided identifiers in the hasVersion array and the this object. 
   * The identifiers are sorted and joined with an underscore. The resulting string is then encoded to base64.
   * 
   * NOTE! The data in the dataset is not to be trusted. Not all objects with versions link to each other.
   * This means there could be two or more clusters of versions that are linked via one object. This should
   * be handled in a data cleaning process.
   * 
   * @returns The encoded base64 strings based on a string containing an ordered list of identifiers.
   */
  const visualItemVersionId = hasVersion ? btoa([{ identifier: data.identifier }, ...hasVersion].map((version: any) => version.identifier).sort((a, b) => a.localeCompare(b)).join('_')) : undefined;

  if (
    !hasType &&
    !description &&
    !physicalDescription &&
    !physicalCondition &&
    !isReferencedBy &&
    !subject &&
    !spatial &&
    !depicts &&
    !producedIn &&
    !internalNote &&
    !hasTranscription &&
    !provenance &&
    !reference &&
    !typeOfDamage &&
    !abstract &&
    !language &&
    !placeOfPublication &&
    !publishedYear &&
    !publisher &&
    !issued &&
    !editor &&
    !hasVersion &&
    !originalCreator
  ) {
    return data;
  }

  delete data.hasType
  delete data.description
  delete data.physicalDescription
  delete data.physicalCondition
  delete data.isReferencedBy
  delete data.subject
  delete data.spatial
  delete data.depicts
  delete data.producedIn
  delete data.hasTranscription
  delete data.provenance
  delete data.reference
  delete data.typeOfDamage
  delete data.abstract
  delete data.language
  delete data.placeOfPublication
  delete data.publishedYear
  delete data.publisher
  delete data.issued
  delete data.editor
  delete data.hasVersion
  delete data.originalCreator

  let isReferencedByArray: any[] = [];
  let descriptionArray: any[] = [];
  let physicalDescriptionArray: any[] = [];
  let physicalConditionArray: any[] = [];
  let showsArray: any[] = [];
  let representsTypeConceptArray: any[] = [];
  let representsSpatialArray: any[] = [];
  let representsDepictionArray: any[] = [];
  let producedInArray: any[] = [];
  let aboutSpatialArray: any[] = [];
  let aboutSubjectArray: any[] = [];
  let carriesArray: any[] = [];
  let transcriptionMarkdown: any = undefined
  let provenanceArray: any[] = []
  let referenceArray: any[] = []
  let abstractArray: any[] = []

  // if there is a link to a html file, we need to fetch the content and convert it to markdown
  if (hasTranscription?.includes('.html')) {
    const response = await fetch(hasTranscription);
    const html = await response.text();
    transcriptionMarkdown = NodeHtmlMarkdown.translate(html);
  }

  const classified_as = [
    {
      id: classToAttMapping[hasType]?.mapping ?? "https://fix.me",
      type: "Type",
      _label: hasType,
    }
  ];

  if (isReferencedBy) {
    isReferencedByArray = isReferencedBy.map((reference: any) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatRelatedTextualReferencesType
        ],
        language: [
          getLanguage(reference._label)
        ],
        _label: reference._label,
        content: reference.description.no[0],
      }
    });
  }

  // This is ubbont:reference (strings), not to be confused with 
  // dct:references (objects). We get the references from the 
  // ubbont:isReferencedBy above.
  if (reference) {
    referenceArray = [{
      type: "LinguisticObject",
      classified_as: [
        aatRelatedTextualReferencesType
      ],
      language: [
        getLanguage('no')
      ],
      content: reference,
    }]
  }

  if (description) {
    descriptionArray = Object.entries(description).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatDescriptionsType,
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (abstract && !isEqual(description, abstract)) {
    abstractArray = Object.entries(abstract).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatAbstractsType,
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  // InternalNote is not available in public endpoint, but
  // we will index later from internal dataset and filter these internal
  // props out in the public ES index.
  if (internalNote) {
    descriptionArray = Object.entries(internalNote).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatInternalNoteType
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
          aatPhysicalDescriptionType
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (typeOfDamage) {
    provenanceArray = [{
      type: "LinguisticObject",
      classified_as: [
        aatPhysicalDescriptionType
      ],
      language: [
        getLanguage('no')
      ],
      content: typeOfDamage
    }];
  }

  if (physicalCondition) {
    physicalConditionArray = Object.entries(physicalCondition).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatPhysicalConditionsType,
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (typeof provenance === "object") {
    provenanceArray = Object.entries(provenance).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatProvenanceStatementsType,
        ],
        language: [
          getLanguage(key)
        ],
        content: value[0]
      }
    });
  }

  if (typeof provenance === "string") {
    provenanceArray = [{
      type: "LinguisticObject",
      classified_as: [
        aatProvenanceStatementsType
      ],
      language: [
        getLanguage('no')
      ],
      content: provenance
    }];
  }

  if (producedIn) {
    producedInArray = producedIn.map((event: any) => {
      return {
        id: event.id,
        type: event.type,
        _label: event._label
      }
    });
  }

  // If it is not a text, we need to add the subject, spatial and 
  // depicts to the represents or represents_instance_of_type array
  if (spatial && type !== "Text") {
    representsSpatialArray = spatial.map((concept: any) => {
      return {
        id: concept.id,
        type: "Place",
        _label: concept._label
      }
    });
  }

  if (subject && type !== "Text") {
    representsTypeConceptArray = subject.map((concept: any) => {
      return {
        id: concept.id,
        type: "Type",
        _label: concept._label
      }
    });
  }

  if (depicts && type !== "Text") {
    representsDepictionArray = depicts.map((actor: any) => {
      return {
        id: actor.id,
        type: "Type",
        _label: actor._label
      }
    });
  }

  if (type === "Image") {
    showsArray = [{
      id: `${DOMAIN}/visualitem/${visualItemVersionId ?? randomUUID()}`,
      type: "VisualItem",
      creation: {
        type: "Creation",
        carried_out_by: originalCreator ? originalCreator.map((creator: any) => {
          return {
            id: creator.id,
            type: creator.type,
            _label: creator._label,
          }
        }) : [],
      },
      represents: [
        ...representsDepictionArray,
        ...representsSpatialArray,
        ...producedInArray,
      ],
      represents_instance_of_type: [
        ...representsTypeConceptArray
      ],
      shown_by: hasVersion ? hasVersion.map((version: any) => {
        return {
          id: `http://localhost:3009/legacy/marcus/${version.identifier}`,
          type: version.type,
          _label: version._label,
        }
      }) : [],
    }]
  }

  // If the type is text, we need to add the transcription to the carries array
  // Add subject to the about property
  if (subject && type === "Text") {
    aboutSubjectArray = subject.map((concept: any) => {
      return {
        id: concept.id,
        type: "Type",
        _label: concept._label
      }
    });
  }

  // Add spatial to the about property
  if (spatial && type === "Text") {
    aboutSpatialArray = spatial.map((place: any) => {
      return {
        id: place.id,
        type: "Type",
        _label: place._label
      }
    });
  }

  if (type === "Text") {
    carriesArray = [{
      id: `${DOMAIN}/text/${randomUUID()}`,
      type: "LinguisticObject",
      _label: {
        no: [`Innholdet til ${data.identifier}`],
        en: [`Content of ${data.identifier}`],
      },
      carried_out_by: editor ? editor.map((editor: any) => {
        return {
          id: editor.id,
          type: editor.type,
          _label: editor._label,
        }
      }
      ) : [],
      about: [
        ...aboutSubjectArray,
        ...aboutSpatialArray,
        ...producedInArray,
      ],
      content: transcriptionMarkdown ?? undefined,
      language: language ? [getLanguage(language.identifier)] : [],
      used_for: isPublication ? [{
        type: "Activity",
        _label: {
          no: [`Publiseringen av "${data._label.no}"`]
        },
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300054686",
            type: "Type",
            _label: "Publishing"
          }
        ],
        timespan: getTimespan(publishedYear ?? issued, undefined, undefined),
        took_place_at: placeOfPublication ? placeOfPublication.map((place: any) => {
          return {
            id: place.id,
            type: 'Place',
            _label: place._label,
          }
        }) : [],
        carried_out_by: publisher ? publisher.map((publisher: any) => {
          return {
            id: publisher.id,
            type: "Group",
            _label: publisher._label,
          }
        }) : []
      }] : [],
    }]
  }


  return omitEmptyEs({
    ...data,
    classified_as,
    referred_to_by: [
      ...descriptionArray,
      ...abstractArray,
      ...isReferencedByArray,
      ...physicalDescriptionArray,
      typeOfDamage,
      ...physicalConditionArray,
      ...provenanceArray,
      ...referenceArray,
    ],
    shows: showsArray,
    carries: [
      ...carriesArray,
    ],
  });
}
