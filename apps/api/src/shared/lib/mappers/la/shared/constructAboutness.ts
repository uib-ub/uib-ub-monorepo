import { getLanguage } from '@shared/lib/mappers/la/getLanguage';
import { getLAApiType, mapToGeneralClass, Publication } from '@shared/lib/mappers/la/mapToGeneralClass';
import { aatAbstractsType, aatCreationDateDescriptionType, aatDescriptionsType, aatDisplayBiographyType, aatInternalNoteType, aatPaginationStatementType, aatPhysicalConditionsType, aatPhysicalDescriptionType, aatProvenanceStatementsType, aatPublishingType, aatRelatedTextualReferencesType } from '@shared/lib/mappers/la/staticMapping';
import { env } from '@env';
import { coalesceLabel } from '@shared/utils/coalesceLabel';
import { getTimeSpan } from '@shared/lib/mappers/la/shared/constructTimeSpan';
import isEqual from 'lodash/isEqual';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import omitEmptyEs from 'omit-empty-es';

// TODO: Add "culture statement"
// TODO: Use markdown for all text fields, and add format: "text/markdown"

export const constructAboutness = async (data: any) => {
  const {
    hasType,
    description,
    physicalDescription,
    physicalCondition,
    subject,
    spatial,
    locationFor,
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
    profession,
    references,
    rodeNr,
    extent,
    pageStart,
    pageEnd,
    date,
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
    !subject &&
    !spatial &&
    !locationFor &&
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
    !originalCreator &&
    !profession &&
    !references &&
    !rodeNr &&
    !extent &&
    !pageStart &&
    !pageEnd &&
    !date
  ) {
    return data;
  }

  delete data.hasType
  delete data.description
  delete data.physicalDescription
  delete data.physicalCondition
  delete data.subject
  delete data.spatial
  delete data.locationFor
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
  delete data.profession
  delete data.references
  delete data.rodeNr
  delete data.depiction // TODO: Not mapped as it is the inverse of depicts
  delete data.pageStart
  delete data.pageEnd
  delete data.date

  let descriptionArray: any[] = [];
  let physicalDescriptionArray: any[] = [];
  let creationDateDescriptionArray: any[] = [];
  let physicalConditionArray: any[] = [];
  let showsArray: any[] = [];
  let representsTypeConceptArray: any[] = [];
  let representsSpatialArray: any[] = [];
  let representsDepictionArray: any[] = [];
  let producedInArray: any[] = [];
  let aboutSpatialArray: any[] = [];
  let aboutSubjectArray: any[] = [];
  let aboutLocationArray: any[] = [];
  let carriesArray: any[] = [];
  let transcriptionMarkdown: any = undefined
  let provenanceArray: any[] = []
  let referenceArray: any[] = []
  let referencesArray: any[] = []
  let abstractArray: any[] = []
  let professionArray: any[] = []
  let rodeNrArray: any[] = []
  let paginationArray: any[] = []

  // if there is a link to a html file, we need to fetch the content and convert it to markdown
  if (hasTranscription?.includes('.html')) {
    const response = await fetch(hasTranscription);
    const html = await response.text();
    transcriptionMarkdown = NodeHtmlMarkdown.translate(html);
  }

  if (profession) {
    professionArray = [{
      type: "LinguisticObject",
      classified_as: [
        aatDisplayBiographyType,
      ],
      language: [
        getLanguage('no')
      ],
      content: profession.join('; ')
    }]
  };

  if (references) {
    referencesArray = Object.entries(references).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatRelatedTextualReferencesType,
        ],
        language: [
          getLanguage(key)
        ],
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
      }
    });
  }

  // This is ubbont:reference (strings), not to be confused with 
  // dct:references (objects).
  if (reference) {
    referenceArray = reference.map((ref: string) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatRelatedTextualReferencesType
        ],
        language: [
          getLanguage('no')
        ],
        content: ref,
      };
    });
  }

  // Rode nr is a reference to the old place name in Bergen.
  // We need to map this as a textual reference.
  if (rodeNr) {
    rodeNrArray = rodeNr.map((ref: string) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatRelatedTextualReferencesType
        ],
        language: [
          getLanguage('no')
        ],
        content: ref,
      };
    });
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
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
      }
    });
  }

  if (date) {
    creationDateDescriptionArray = [{
      type: "LinguisticObject",
      classified_as: [
        aatCreationDateDescriptionType,
      ],
      language: [
        getLanguage('no')
      ],
      content: NodeHtmlMarkdown.translate(date),
      format: 'text/markdown',
    }]
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
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
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
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
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
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
      }
    });
  }

  if (extent && !Number.isInteger(extent)) {
    physicalDescriptionArray = Object.entries(extent).map(([key, value]: [string, any]) => {
      return {
        type: "LinguisticObject",
        classified_as: [
          aatPhysicalDescriptionType
        ],
        language: [
          getLanguage('no')
        ],
        content: value,
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
      content: NodeHtmlMarkdown.translate(typeOfDamage),
      format: 'text/markdown',
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
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
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
        content: NodeHtmlMarkdown.translate(value[0]),
        format: 'text/markdown',
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
        id: `${env.PROD_URL}/events/${event.identifier}`,
        type: event.type,
        _label: coalesceLabel(event._label),
      }
    });
  }

  if (pageStart && pageEnd) {
    paginationArray = [{
      type: "LinguisticObject",
      classified_as: [
        aatPaginationStatementType,
      ],
      content: `${pageStart ?? ''}-${pageEnd ?? ''}`,
    }]
  }

  // If it is not a text, we need to add the subject, spatial and 
  // depicts to the represents or represents_instance_of_type array
  if (spatial && type !== "Text") {
    representsSpatialArray = spatial.map((concept: any) => {
      return {
        id: `${env.PROD_URL}/places/${concept.identifier}`,
        type: "Place",
        _label: coalesceLabel(concept._label),
      }
    });
  }

  if (subject && type !== "Text") {
    representsTypeConceptArray = subject.map((concept: any) => {
      return {
        id: `${env.PROD_URL}/concepts/${concept.identifier}`,
        type: "Type",
        _label: coalesceLabel(concept._label),
      }
    });
  }

  if (depicts && type !== "Text") {
    representsDepictionArray = depicts.map((actor: any) => {
      const { path, type } = getLAApiType(actor.type);
      return {
        id: `${env.PROD_URL}/${path}/${actor.identifier}`,
        type,
        _label: coalesceLabel(actor._label),
        content: JSON.stringify(actor),
      }
    });
  }

  if (type === "Image") {
    showsArray = [{
      id: `${env.PROD_URL}/visualitem/${visualItemVersionId ?? crypto.randomUUID()}`,
      type: "VisualItem",
      creation: originalCreator ? {
        type: "Creation",
        carried_out_by: originalCreator ? originalCreator.map((creator: any) => {
          return {
            id: creator.id,
            type: creator.type,
            _label: coalesceLabel(creator._label),
          }
        }) : [],
      } : [],
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
          id: `${env.PROD_URL}/items/${version.identifier}`,
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
      const { path, type } = getLAApiType(concept.type);
      return {
        id: `${env.PROD_URL}/${path}/${concept.identifier}`,
        type,
        _label: coalesceLabel(concept._label),
      }
    });
  }

  // Add spatial to the about property
  if (spatial && type === "Text") {
    aboutSpatialArray = spatial.map((place: any) => {
      return {
        id: `${env.PROD_URL}/places/${place.identifier}`,
        type: "Place",
        _label: coalesceLabel(place._label),
      }
    });
  }

  // Add spatial to the about property
  if (locationFor && type === "Text") {
    aboutLocationArray = locationFor.map((place: any) => {
      return {
        id: `${env.PROD_URL}/places/${place.identifier}`,
        type: "Place",
        _label: coalesceLabel(place._label),
      }
    });
  }

  if (type === "Text") {
    carriesArray = [{
      id: `${env.PROD_URL}/texts/${crypto.randomUUID()}`, // TODO: use an id that we can use to create this LinguisticObject
      type: "LinguisticObject",
      _label: `Tekstlig innhold`,
      carried_out_by: editor ? editor.map((editor: any) => {
        return {
          id: `${env.PROD_URL}/persons/${editor.identifier}`,
          type: "Person",
          _label: coalesceLabel(editor._label),
        }
      }
      ) : [],
      about: [
        ...aboutSubjectArray,
        ...aboutSpatialArray,
        ...aboutLocationArray,
        ...producedInArray,
      ],
      content: transcriptionMarkdown ?? undefined,
      language: language ? [getLanguage(language.identifier)] : [],
      used_for: isPublication ? [{
        type: "Activity",
        _label: `Publiseringen av "${coalesceLabel(data?.label)}"`,
        classified_as: [
          aatPublishingType,
        ],
        timespan: getTimeSpan(publishedYear ?? issued, undefined, undefined),
        took_place_at: placeOfPublication ? placeOfPublication.map((place: any) => {
          return {
            id: `${env.PROD_URL}/places/${place.identifier}`,
            type: 'Place',
            _label: coalesceLabel(place._label),
          }
        }) : [],
        carried_out_by: publisher ? publisher.map((publisher: any) => {
          return {
            id: `${env.PROD_URL}/groups/${publisher.identifier}`,
            type: "Group",
            _label: coalesceLabel(publisher._label),
          }
        }) : []
      }] : [],
    }]
  }


  return omitEmptyEs({
    ...data,
    referred_to_by: [
      ...descriptionArray,
      ...abstractArray,
      ...physicalDescriptionArray,
      ...creationDateDescriptionArray,
      ...physicalConditionArray,
      ...paginationArray,
      ...provenanceArray,
      ...referenceArray,
      ...referencesArray,
      ...rodeNrArray,
      ...professionArray
    ],
    shows: showsArray,
    carries: [
      ...carriesArray,
    ],
  });
}
