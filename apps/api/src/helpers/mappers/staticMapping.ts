import { env } from '@config/env';
import { getLanguage } from './getLanguage';

export const institutions: { [key: string]: { id: string; type: string; _label: Record<string, string[]> } } = {
  uib: {
    id: `${env.API_URL}/groups/79543723-f0e9-40a6-bfb9-4830f080e887`,
    type: 'Group',
    _label: {
      no: ['Universitetet i Bergen'],
      en: ['University of Bergen'],
    },
  },
  ubb: {
    id: `${env.API_URL}/groups/0f4d957a-5476-4e88-b2b6-71a06c1ecf9c`,
    type: "Group",
    _label: {
      no: ["Universitetsbiblioteket i Bergen"],
      en: ["University of Bergen Library"],
    }
  },
  spes: {
    id: `${env.API_URL}/groups/de88f626-4b67-4fef-9d88-6930e8b5c645`,
    type: "Group",
    _label: {
      no: ["Spesialsamlingene ved Universitetsbiblioteket i Bergen"],
      en: ["Special collections atht the University of Bergen Library"],
    }
  },
  sab: {
    id: `${env.API_URL}/groups/statsarkivet-i-bergen`,
    type: 'Group',
    _label: {
      no: ['Statsarkivet i Bergen'],
    },
  },
  bba: {
    id: `${env.API_URL}/groups/3f0ed65b-8e5c-484e-8805-89619ee56a77`,
    type: 'Group',
    _label: {
      no: ['Bergen byarkiv'],
    },
  }
}

/**
 * AAT Types
 */
export const aatHeightType = {
  id: "https://vocab.getty.edu/aat/300055644",
  type: "Type",
  _label: "Height"
}

export const aatWidthtType = {
  id: "https://vocab.getty.edu/aat/300055647",
  type: "Type",
  _label: "Width"
}

export const aatCMUnitType = {
  id: "https://vocab.getty.edu/aat/300379098",
  type: "MeasurementUnit",
  _label: "Centimeters"
}

export const aatCircaType = {
  id: "https://vocab.getty.edu/aat/300435723",
  type: "Type",
  _label: "Circa"
}

export const aatReproductionsType = {
  id: "https://vocab.getty.edu/aat/300015643",
  type: "Type",
  _label: "Reproductions (derivative objects)"
}

export const aatPhysicalDescriptionType = {
  id: "https://vocab.getty.edu/aat/300435452",
  type: "Type",
  _label: "Physical description",
};

export const aatCreationDateDescriptionType = {
  id: "https://vocab.getty.edu/aat/300435447",
  type: "Type",
  _label: "Creation date description",
};

export const aatInternalNoteType = {
  id: "https://vocab.getty.edu/aat/300445031",
  type: "Type",
  _label: "Internal notes",
};

export const aatRelatedTextualReferencesType = {
  id: "https://vocab.getty.edu/aat/300444122",
  type: "Type",
  _label: "Related textual references",
};

export const aatDescriptionsType = {
  id: "https://vocab.getty.edu/aat/300435416",
  type: "Type",
  _label: "Description",
};

export const aatAbstractsType = {
  id: "https://vocab.getty.edu/aat/300026032",
  type: "Type",
  _label: "Abstracts (summaries)",
};

export const aatPhysicalConditionsType = {
  id: "https://vocab.getty.edu/aat/300435425",
  type: "Type",
  _label: "Condition/examination description",
};

export const aatProvenanceStatementsType = {
  id: "https://vocab.getty.edu/aat/300444174",
  type: "Type",
  _label: "Provenance statement",
};

export const aatCountOfType = {
  id: "https://vocab.getty.edu/aat/300404433",
  type: "Type",
  _label: "Count Of"
};

export const aatPagesMeasurementUnitType = {
  id: "https://vocab.getty.edu/aat/300194222",
  type: "MeasurementUnit",
  _label: "Pages"
};

export const aatDigitalImageType = {
  id: "https://vocab.getty.edu/aat/300215302",
  type: "Type",
  _label: "Digital Image"
}

export const aatThumbnailsType = {
  id: "https://fix.me",
  type: "Type",
  _label: "Thumbnails"
}

export const aatWebPageType = {
  id: "https://vocab.getty.edu/aat/300264578",
  type: "Type",
  _label: "Web Page"
}

export const aatAccessionNumberType = {
  id: "https://vocab.getty.edu/aat/300312355",
  type: "Type",
  _label: "Accession Number"
}

export const aatHistoricalTermsType = {
  id: "https://vocab.getty.edu/aat/300449151",
  type: "Type",
  _label: "Historical terms"
}

export const aatIsbnType = {
  id: "https://vocab.getty.edu/aat/300417443",
  type: "Type",
  _label: "ISBN"
}

export const aatCatalogNumbersType = {
  id: "https://vocab.getty.edu/aat/300404620",
  type: "Type",
  _label: "Catalog numbers"
}

export const aatPreferredTermsType = {
  id: "https://vocab.getty.edu/aat/300404670",
  type: "Type",
  _label: "Preferred terms"
}

export const aatConstructedTitlesType = {
  id: "https://vocab.getty.edu/aat/300417205",
  type: "Type",
  _label: "Constructed titles"
}

export const aatPrimaryNameType = {
  id: "https://vocab.getty.edu/aat/300404670",
  type: "Type",
  _label: "Primary Name"
}

export const aatAlternativeTitlesType = {
  id: "https://vocab.getty.edu/aat/300417226",
  type: "Type",
  _label: "Alternative titles"
}

export const aatProvenanceActivityType = {
  id: "https://vocab.getty.edu/aat/300055863",
  type: "Type",
  _label: "Provenance Activity"
}

export const aatPaginationStatementType = {
  id: "https://vocab.getty.edu/aat/300435440",
  type: "Type",
  _label: "Pagination Statement",
}

export const aatPublishingType = {
  id: "https://vocab.getty.edu/aat/300054686",
  type: "Type",
  _label: "Publishing"
}

export const fixmeCorrespondanceType = {
  id: "https://fix.me",
  type: "Type",
  _label: "Correspondance"
}

export const aatBriefTextType = {
  id: "https://vocab.getty.edu/aat/300418049",
  type: "Type",
  _label: "Brief Text"
}

export const aatAcknowledgementsType = {
  id: "https://vocab.getty.edu/aat/300026687",
  type: "Type",
  _label: "Acknowledgements"
}

export const aatRightsType = {
  id: "https://vocab.getty.edu/aat/300417696",
  type: "Type",
  _label: "Rights (Legal Concept)"
}

export const aatIdentificationNumberType = {
  id: "https://vocab.getty.edu/aat/300404626",
  type: "Type",
  _label: "Identification Number"
}

export const aatTitlesType = {
  id: "https://vocab.getty.edu/aat/300417193",
  type: "Type",
  _label: "Titles (General, Names)"
}

export const aatCultureType = {
  id: "https://vocab.getty.edu/aat/300055768",
  type: "Type",
  _label: "Culture"
}

export const aatFamilyNameType = {
  id: "https://vocab.getty.edu/aat/300435247",
  type: "Type",
  _label: "Family Name"
}

export const aatLastNameType = {
  id: "https://vocab.getty.edu/aat/300404652",
  type: "Type",
  _label: "Last Name"
}

export const aatFirstNameType = {
  id: "https://vocab.getty.edu/aat/300404651",
  type: "Type",
  _label: "First Name"
}

export const aatMaidenNameType = {
  id: "https://vocab.getty.edu/aat/300404682",
  type: "Type",
  _label: "Maiden Name"
}

export const aatMiddleNameType = {
  id: "https://vocab.getty.edu/aat/300404654",
  type: "Type",
  _label: "Middle Name"
}

export const aatStageNameType = {
  id: "https://vocab.getty.edu/aat/300404679",
  type: "Type",
  _label: "Stage Name"
}

export const aatSuffixesType = {
  id: "https://vocab.getty.edu/aat/300404662",
  type: "Type",
  _label: "Suffixes"
}

export const aatPrefixesType = {
  id: "https://vocab.getty.edu/aat/300404845",
  type: "Type",
  _label: "Prefixes"
}

export const aatPseudonymsType = {
  id: "https://vocab.getty.edu/aat/300404657",
  type: "Type",
  _label: "Pseudonyms"
}

export const aatDisplayBiographyType = {
  id: "https://vocab.getty.edu/aat/300435422",
  type: "Type",
  _label: "Display biography"
}

export const aatMaleType = {
  id: "https://vocab.getty.edu/aat/300189559",
  type: "Type",
  _label: "Male"
}

export const aatFemaleType = {
  id: "https://vocab.getty.edu/aat/300189557",
  type: "Type",
  _label: "Female"
}

export const aatSiblingsType = {
  id: "https://vocab.getty.edu/aat/300187624",
  type: "Type",
  _label: "Siblings"
}

/**
 * Rights and Licenses
 */
export const ccPublicDomainMarkType = {
  id: "http://creativecommons.org/publicdomain/zero/1.0/",
  type: "Type",
  _label: "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication",
  identified_by: [
    {
      type: 'Name',
      content: {
        no: ["CC0 1.0 Universal (CC0 1.0) Ingen opphavsrett"],
        en: ["CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"],
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is marked with the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket er merket med CC0 1.0 Universal (CC0 1.0) Ingen opphavsrett.",
    }
  ]
}

export const rsCopyrightUndeterminedType = {
  id: "https://rightsstatements.org/vocab/UND/1.0/",
  type: "Type",
  _label: "Copyright Undetermined",
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Copyright Undetermined',
        no: 'Opphavsrett ikke fastsatt'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "The copyright status of this work is not known.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Opphavsrettsstatusen til dette verket er ikke kjent.",
    }
  ]
}

export const rsInCopyrighttype = {
  id: "https://rightsstatements.org/vocab/InC/1.0/",
  type: "Type",
  _label: "In Copyright",
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'In Copyright',
        no: 'All rettigheter reservert'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "All rights reserved.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "All rettigheter reservert.",
    }
  ]
}

export const attributionNonCommercialNoDerivsType = {
  id: 'http://creativecommons.org/licenses/by-nc-nd/4.0/',
  type: 'Type',
  _label: 'CC BY-NC-ND 4.0',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Attribution-NonCommercial-NoDerivs',
        no: 'Navngivelse-IkkeKommersiell-IngenBearbeidelser'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivs 4.0 International License.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket er lisensiert under Creative Commons Navngivelse-IkkeKommersiell-IngenBearbeidelser 4.0 Internasjonal Lisens.",
    }
  ]
};
export const attributionType = {
  id: 'http://creativecommons.org/licenses/by/4.0/',
  type: 'Type',
  _label: 'CC BY 4.0',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Attribution',
        no: 'Navngivelse'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is licensed under the Creative Commons Attribution 4.0 International License.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket er lisensiert under Creative Commons Navngivelse 4.0 Internasjonal Lisens.",
    }
  ]
};
export const attributionShareAlikeType = {
  id: 'http://creativecommons.org/licenses/by-sa/4.0/',
  type: 'Type',
  _label: 'CC BY-SA 4.0',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Attribution-ShareAlike',
        no: 'Navngivelse-DelPåSammeVilkår'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket er lisensiert under Creative Commons Navngivelse-DelPåSammeVilkår 4.0 Internasjonal Lisens.",
    }
  ]
};

export const attributionNonCommercialType = {
  id: 'http://creativecommons.org/licenses/by-nc/4.0/',
  type: 'Type',
  _label: 'CC NC 4.0',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Attribution-NonCommercial',
        no: 'Navngivelse-IkkeKommersiell'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket er lisensiert under Creative Commons Navngivelse-IkkeKommersiell 4.0 Internasjonal Lisens.",
    }
  ]
};

export const attributionNoDerivsType = {
  id: 'http://creativecommons.org/licenses/by-nd/4.0/',
  type: 'Type',
  _label: 'CC ND 4.0',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Attribution-NoDerivs',
        no: 'Navngivelse-IngenBearbeidelser'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is licensed under the Creative Commons Attribution-NoDerivs 4.0 International License.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket er lisensiert under Creative Commons Navngivelse-IngenBearbeidelser 4.0 Internasjonal Lisens.",
    }
  ]
};

export const publicDomainType = {
  id: 'http://creativecommons.org/publicdomain/mark/1.0',
  type: 'Type',
  _label: 'Public Domain Mark',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Public Domain Mark',
        no: 'Falt i det fri'
      }
    }
  ],
  subject_of: [
    {
      type: "LinguisticObject",
      language: [getLanguage('en')],
      content: "This work is marked with the Public Domain Mark.",
    },
    {
      type: "LinguisticObject",
      language: [getLanguage('no')],
      content: "Dette verket har falt i det fri og er er merket med Public Domain Mark.",
    }
  ]
};