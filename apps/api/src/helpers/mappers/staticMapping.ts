import _ from 'lodash';

export const aatHeightType = {
  id: "https://vocab.getty.edu/aat/300055644",
  type: "Type",
  _label: "Height"
}

export const aatWidthtType = {
  id: "http://vocab.getty.edu/aat/300055647",
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

export const aatPhysicalDescriptionType = {
  id: "https://vocab.getty.edu/aat/300435452",
  type: "Type",
  _label: "Physical description",
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
  id: "http://vocab.getty.edu/aat/300435416",
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
  id: "http://vocab.getty.edu/aat/300404433",
  type: "Type",
  _label: "Count Of"
};
export const aatPagesMeasurementUnitType = {
  id: "http://vocab.getty.edu/aat/300194222",
  type: "MeasurementUnit",
  _label: "Pages"
};

/**
 * Rights and Licenses
 */
export const rsCopyrightUndeterminedType = {
  id: "http://rightsstatements.org/vocab/UND/1.0/",
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
  ]
}

export const rsInCopyrighttype = {
  id: "http://rightsstatements.org/vocab/InC/1.0/",
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
  ]
}

export const attributionNonCommercialNoDerivsType = {
  id: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
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
  ]
};
export const attributionType = {
  id: 'https://creativecommons.org/licenses/by/4.0/',
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
  ]
};
export const attributionShareAlikeType = {
  id: 'https://creativecommons.org/licenses/by-sa/4.0/',
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
  ]
};

export const attributionNonCommercialType = {
  id: 'https://creativecommons.org/licenses/by-nc/4.0/',
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
  ]
};

export const attributionNoDerivsType = {
  id: 'https://creativecommons.org/licenses/by-nd/4.0/',
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
  ]
};

export const publicDomainType = {
  id: 'https://creativecommons.org/publicdomain/mark/1.0',
  type: 'Type',
  _label: 'Public Domain',
  identified_by: [
    {
      type: 'Name',
      content: {
        en: 'Public Domain',
        no: 'Falt i det fri'
      }
    }
  ]
};