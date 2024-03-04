export const linkedArtContext = {
  "@context": {
    "@version": 1.1,
    "crm": "http://www.cidoc-crm.org/cidoc-crm/",
    "sci": "http://www.ics.forth.gr/isl/CRMsci/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "schema": "http://schema.org/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "dig": "http://www.ics.forth.gr/isl/CRMdig/",
    "la": "https://linked.art/ns/terms/",
    "archaeo": "http://www.cidoc-crm.org/cidoc-crm/CRMarchaeo/",
    "id": "@id",
    "type": "@type",
    "CRMEntity": {
      "@id": "crm:E1_CRM_Entity"
    },
    "TemporalEntity": {
      "@id": "crm:E2_Temporal_Entity"
    },
    "ConditionState": {
      "@id": "crm:E3_Condition_State"
    },
    "Period": {
      "@id": "crm:E4_Period",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Event": {
      "@id": "crm:E5_Event",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Destruction": {
      "@id": "crm:E6_Destruction",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Activity": {
      "@id": "crm:E7_Activity",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Acquisition": {
      "@id": "crm:E8_Acquisition",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Move": {
      "@id": "crm:E9_Move",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "TransferOfCustody": {
      "@id": "crm:E10_Transfer_of_Custody",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Modification": {
      "@id": "crm:E11_Modification",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Production": {
      "@id": "crm:E12_Production",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "AttributeAssignment": {
      "@id": "crm:E13_Attribute_Assignment",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "ConditionAssessment": {
      "@id": "crm:E14_Condition_Assessment"
    },
    "IdentifierAssignment": {
      "@id": "crm:E15_Identifier_Assignment"
    },
    "Measurement": {
      "@id": "crm:E16_Measurement"
    },
    "TypeAssignment": {
      "@id": "crm:E17_Type_Assignment"
    },
    "PhysicalThing": {
      "@id": "crm:E18_Physical_Thing",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "PhysicalObject": {
      "@id": "crm:E19_Physical_Object",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "BiologicalObject": {
      "@id": "crm:E20_Biological_Object",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Person": {
      "@id": "crm:E21_Person",
      "@context": {
        "member": {
          "@id": "crm:P107_has_current_or_former_member",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "crm:P107i_is_current_or_former_member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "HumanMadeObject": {
      "@id": "crm:E22_Human-Made_Object",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "PhysicalHumanMadeThing": {
      "@id": "crm:E24_Physical_Human-Made_Thing",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "HumanMadeFeature": {
      "@id": "crm:E25_Human-Made_Feature",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "PhysicalFeature": {
      "@id": "crm:E26_Physical_Feature",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Site": {
      "@id": "crm:E27_Site",
      "@context": {
        "part": {
          "@id": "crm:P46_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P46i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "ConceptualObject": {
      "@id": "crm:E28_Conceptual_Object"
    },
    "DesignOrProcedure": {
      "@id": "crm:E29_Design_or_Procedure"
    },
    "Right": {
      "@id": "crm:E30_Right",
      "@context": {
        "part": {
          "@id": "crm:P148_has_component",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P148i_is_component_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Document": {
      "@id": "crm:E31_Document"
    },
    "AuthorityDocument": {
      "@id": "crm:E32_Authority_Document"
    },
    "LinguisticObject": {
      "@id": "crm:E33_Linguistic_Object",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Inscription": {
      "@id": "crm:E34_Inscription",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Title": {
      "@id": "crm:E35_Title",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "VisualItem": {
      "@id": "crm:E36_Visual_Item",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Mark": {
      "@id": "crm:E37_Mark",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Actor": {
      "@id": "crm:E39_Actor"
    },
    "Appellation": {
      "@id": "crm:E41_Appellation",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Identifier": {
      "@id": "crm:E42_Identifier",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "TimeSpan": {
      "@id": "crm:E52_Time-Span",
      "@context": {
        "part": {
          "@id": "crm:P86i_contains",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P86_falls_within",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Place": {
      "@id": "crm:E53_Place",
      "@context": {
        "part": {
          "@id": "crm:P89i_contains",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P89_falls_within",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Dimension": {
      "@id": "crm:E54_Dimension"
    },
    "Type": {
      "@id": "crm:E55_Type",
      "@context": {
        "part": {
          "@id": "skos:narrower",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "skos:broader",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Language": {
      "@id": "crm:E56_Language",
      "@context": {
        "part": {
          "@id": "skos:narrower",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "skos:broader",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Material": {
      "@id": "crm:E57_Material",
      "@context": {
        "part": {
          "@id": "skos:narrower",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "skos:broader",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "MeasurementUnit": {
      "@id": "crm:E58_Measurement_Unit",
      "@context": {
        "part": {
          "@id": "skos:narrower",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "skos:broader",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "BeginningOfExistence": {
      "@id": "crm:E63_Beginning_of_Existence",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "EndOfExistence": {
      "@id": "crm:E64_End_of_Existence",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Creation": {
      "@id": "crm:E65_Creation",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Formation": {
      "@id": "crm:E66_Formation",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Birth": {
      "@id": "crm:E67_Birth",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Dissolution": {
      "@id": "crm:E68_Dissolution",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Death": {
      "@id": "crm:E69_Death",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Thing": {
      "@id": "crm:E70_Thing"
    },
    "HumanMadeThing": {
      "@id": "crm:E71_Human-Made_Thing"
    },
    "LegalObject": {
      "@id": "crm:E72_Legal_Object"
    },
    "InformationObject": {
      "@id": "crm:E73_Information_Object",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Group": {
      "@id": "crm:E74_Group",
      "@context": {
        "member": {
          "@id": "crm:P107_has_current_or_former_member",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "crm:P107i_is_current_or_former_member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "PersistentItem": {
      "@id": "crm:E77_Persistent_Item"
    },
    "CuratedHolding": {
      "@id": "crm:E78_Curated_Holding"
    },
    "PartAddition": {
      "@id": "crm:E79_Part_Addition",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "PartRemoval": {
      "@id": "crm:E80_Part_Removal",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Transformation": {
      "@id": "crm:E81_Transformation",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "TypeCreation": {
      "@id": "crm:E83_Type_Creation"
    },
    "Joining": {
      "@id": "crm:E85_Joining",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Leaving": {
      "@id": "crm:E86_Leaving",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "CurationActivity": {
      "@id": "crm:E87_Curation_Activity"
    },
    "PropositionalObject": {
      "@id": "crm:E89_Propositional_Object",
      "@context": {
        "part": {
          "@id": "crm:P148_has_component",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P148i_is_component_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "SymbolicObject": {
      "@id": "crm:E90_Symbolic_Object",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "SpacetimeVolume": {
      "@id": "crm:E92_Spacetime_Volume"
    },
    "Presence": {
      "@id": "crm:E93_Presence"
    },
    "Purchase": {
      "@id": "crm:E96_Purchase",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "MonetaryAmount": {
      "@id": "crm:E97_Monetary_Amount"
    },
    "Currency": {
      "@id": "crm:E98_Currency",
      "@context": {
        "part": {
          "@id": "skos:narrower",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "skos:broader",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "ProductType": {
      "@id": "crm:E99_Product_Type"
    },
    "Name": {
      "@id": "crm:E33_E41_Linguistic_Appellation",
      "@context": {
        "part": {
          "@id": "crm:P106_is_composed_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P106i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "identified_by": {
      "@id": "crm:P1_is_identified_by",
      "@type": "@id",
      "@container": "@set"
    },
    "identifies": {
      "@id": "crm:P1i_identifies",
      "@type": "@id"
    },
    "classified_as": {
      "@id": "crm:P2_has_type",
      "@type": "@id",
      "@container": "@set"
    },
    "type_of": {
      "@id": "crm:P2i_is_type_of",
      "@type": "@id",
      "@container": "@set"
    },
    "note": {
      "@id": "crm:P3_has_note"
    },
    "timespan": {
      "@id": "crm:P4_has_time-span",
      "@type": "@id"
    },
    "timespan_of": {
      "@id": "crm:P4i_is_time-span_of",
      "@type": "@id",
      "@container": "@set"
    },
    "subState": {
      "@id": "crm:P5_consists_of",
      "@type": "@id",
      "@container": "@set"
    },
    "subState_of": {
      "@id": "crm:P5i_forms_part_of",
      "@type": "@id",
      "@container": "@set"
    },
    "took_place_at": {
      "@id": "crm:P7_took_place_at",
      "@type": "@id",
      "@container": "@set"
    },
    "location_of": {
      "@id": "crm:P7i_witnessed",
      "@type": "@id",
      "@container": "@set"
    },
    "took_place_on_or_within": {
      "@id": "crm:P8_took_place_on_or_within",
      "@type": "@id",
      "@container": "@set"
    },
    "witnessed": {
      "@id": "crm:P8i_witnessed",
      "@type": "@id",
      "@container": "@set"
    },
    "falls_within": {
      "@id": "crm:P10_falls_within",
      "@type": "@id",
      "@container": "@set"
    },
    "contains": {
      "@id": "crm:P10i_contains",
      "@type": "@id",
      "@container": "@set"
    },
    "participant": {
      "@id": "crm:P11_had_participant",
      "@type": "@id",
      "@container": "@set"
    },
    "participated_in": {
      "@id": "crm:P11i_participated_in",
      "@type": "@id",
      "@container": "@set"
    },
    "involved": {
      "@id": "crm:P12_occurred_in_the_presence_of",
      "@type": "@id",
      "@container": "@set"
    },
    "present_at": {
      "@id": "crm:P12i_was_present_at",
      "@type": "@id",
      "@container": "@set"
    },
    "destroyed": {
      "@id": "crm:P13_destroyed",
      "@type": "@id"
    },
    "destroyed_by": {
      "@id": "crm:P13i_was_destroyed_by",
      "@type": "@id"
    },
    "carried_out_by": {
      "@id": "crm:P14_carried_out_by",
      "@type": "@id",
      "@container": "@set"
    },
    "carried_out": {
      "@id": "crm:P14i_performed",
      "@type": "@id",
      "@container": "@set"
    },
    "influenced_by": {
      "@id": "crm:P15_was_influenced_by",
      "@type": "@id",
      "@container": "@set"
    },
    "influenced": {
      "@id": "crm:P15i_influenced",
      "@type": "@id",
      "@container": "@set"
    },
    "used_specific_object": {
      "@id": "crm:P16_used_specific_object",
      "@type": "@id",
      "@container": "@set"
    },
    "used_for": {
      "@id": "crm:P16i_was_used_for",
      "@type": "@id",
      "@container": "@set"
    },
    "motivated_by": {
      "@id": "crm:P17_was_motivated_by",
      "@type": "@id",
      "@container": "@set"
    },
    "motivated": {
      "@id": "crm:P17i_motivated",
      "@type": "@id",
      "@container": "@set"
    },
    "intended_use_of": {
      "@id": "crm:P19_was_intended_use_of",
      "@type": "@id",
      "@container": "@set"
    },
    "made_for": {
      "@id": "crm:P19i_was_made_for",
      "@type": "@id",
      "@container": "@set"
    },
    "specific_purpose": {
      "@id": "crm:P20_had_specific_purpose",
      "@type": "@id",
      "@container": "@set"
    },
    "specific_purpose_of": {
      "@id": "crm:P20i_was_purpose_of",
      "@type": "@id",
      "@container": "@set"
    },
    "general_purpose": {
      "@id": "crm:P21_had_general_purpose",
      "@type": "@id",
      "@container": "@set"
    },
    "purpose_of": {
      "@id": "crm:P21i_was_purpose_of",
      "@type": "@id",
      "@container": "@set"
    },
    "transferred_title_to": {
      "@id": "crm:P22_transferred_title_to",
      "@type": "@id",
      "@container": "@set"
    },
    "acquired_title_through": {
      "@id": "crm:P22i_acquired_title_through",
      "@type": "@id",
      "@container": "@set"
    },
    "transferred_title_from": {
      "@id": "crm:P23_transferred_title_from",
      "@type": "@id",
      "@container": "@set"
    },
    "surrendered_title_through": {
      "@id": "crm:P23i_surrendered_title_through",
      "@type": "@id",
      "@container": "@set"
    },
    "transferred_title_of": {
      "@id": "crm:P24_transferred_title_of",
      "@type": "@id",
      "@container": "@set"
    },
    "changed_ownership_through": {
      "@id": "crm:P24i_changed_ownership_through",
      "@type": "@id",
      "@container": "@set"
    },
    "moved": {
      "@id": "crm:P25_moved",
      "@type": "@id",
      "@container": "@set"
    },
    "moved_by": {
      "@id": "crm:P25i_moved_by",
      "@type": "@id",
      "@container": "@set"
    },
    "moved_to": {
      "@id": "crm:P26_moved_to",
      "@type": "@id"
    },
    "destination_of": {
      "@id": "crm:P26i_was_destination_of",
      "@type": "@id",
      "@container": "@set"
    },
    "moved_from": {
      "@id": "crm:P27_moved_from",
      "@type": "@id"
    },
    "origin_of": {
      "@id": "crm:P27i_was_origin_of",
      "@type": "@id",
      "@container": "@set"
    },
    "transferred_custody_from": {
      "@id": "crm:P28_custody_surrendered_by",
      "@type": "@id",
      "@container": "@set"
    },
    "surrendered_custody_through": {
      "@id": "crm:P28i_surrendered_custody_through",
      "@type": "@id",
      "@container": "@set"
    },
    "transferred_custody_to": {
      "@id": "crm:P29_custody_received_by",
      "@type": "@id",
      "@container": "@set"
    },
    "acquired_custody_through": {
      "@id": "crm:P29i_received_custody_through",
      "@type": "@id",
      "@container": "@set"
    },
    "transferred_custody_of": {
      "@id": "crm:P30_transferred_custody_of",
      "@type": "@id",
      "@container": "@set"
    },
    "custody_transferred_through": {
      "@id": "crm:P30i_custody_transferred_through",
      "@type": "@id",
      "@container": "@set"
    },
    "modified": {
      "@id": "crm:P31_has_modified",
      "@type": "@id",
      "@container": "@set"
    },
    "modified_by": {
      "@id": "crm:P31i_was_modified_by",
      "@type": "@id",
      "@container": "@set"
    },
    "technique": {
      "@id": "crm:P32_used_general_technique",
      "@type": "@id",
      "@container": "@set"
    },
    "technique_of": {
      "@id": "crm:P32i_was_technique_of",
      "@type": "@id",
      "@container": "@set"
    },
    "specific_technique": {
      "@id": "crm:P33_used_specific_technique",
      "@type": "@id",
      "@container": "@set"
    },
    "used_by": {
      "@id": "crm:P33i_was_used_by",
      "@type": "@id",
      "@container": "@set"
    },
    "concerned": {
      "@id": "crm:P34_concerned",
      "@type": "@id",
      "@container": "@set"
    },
    "assessed_by": {
      "@id": "crm:P34i_was_assessed_by",
      "@type": "@id",
      "@container": "@set"
    },
    "identified": {
      "@id": "crm:P35_has_identified",
      "@type": "@id",
      "@container": "@set"
    },
    "condition_identified_by": {
      "@id": "crm:P35i_was_identified_by",
      "@type": "@id",
      "@container": "@set"
    },
    "assigned_identifier": {
      "@id": "crm:P37_assigned",
      "@type": "@id",
      "@container": "@set"
    },
    "identifier_assigned_by": {
      "@id": "crm:P37i_was_assigned_by",
      "@type": "@id",
      "@container": "@set"
    },
    "deassigned": {
      "@id": "crm:P38_deassigned",
      "@type": "@id",
      "@container": "@set"
    },
    "deassigned_by": {
      "@id": "crm:P38i_was_deassigned_by",
      "@type": "@id",
      "@container": "@set"
    },
    "measured": {
      "@id": "crm:P39_measured",
      "@type": "@id",
      "@container": "@set"
    },
    "measured_by": {
      "@id": "crm:P39i_was_measured_by",
      "@type": "@id",
      "@container": "@set"
    },
    "observed_dimension": {
      "@id": "crm:P40_observed_dimension",
      "@type": "@id",
      "@container": "@set"
    },
    "observed_in": {
      "@id": "crm:P40i_was_observed_in",
      "@type": "@id",
      "@container": "@set"
    },
    "classified": {
      "@id": "crm:P41_classified",
      "@type": "@id",
      "@container": "@set"
    },
    "classified_by": {
      "@id": "crm:P41i_was_classified_by",
      "@type": "@id",
      "@container": "@set"
    },
    "assigned_type": {
      "@id": "crm:P42_assigned",
      "@type": "@id",
      "@container": "@set"
    },
    "type_assigned_by": {
      "@id": "crm:P42i_was_assigned_by",
      "@type": "@id",
      "@container": "@set"
    },
    "dimension": {
      "@id": "crm:P43_has_dimension",
      "@type": "@id",
      "@container": "@set"
    },
    "dimension_of": {
      "@id": "crm:P43i_is_dimension_of",
      "@type": "@id"
    },
    "condition": {
      "@id": "crm:P44_has_condition",
      "@type": "@id",
      "@container": "@set"
    },
    "condition_of": {
      "@id": "crm:P44i_is_condition_of",
      "@type": "@id",
      "@container": "@set"
    },
    "made_of": {
      "@id": "crm:P45_consists_of",
      "@type": "@id",
      "@container": "@set"
    },
    "incorporated_in": {
      "@id": "crm:P45i_is_incorporated_in",
      "@type": "@id",
      "@container": "@set"
    },
    "preferred_identifier": {
      "@id": "crm:P48_has_preferred_identifier",
      "@type": "@id",
      "@container": "@set"
    },
    "preferred_identifier_of": {
      "@id": "crm:P48i_is_preferred_identifier_of",
      "@type": "@id",
      "@container": "@set"
    },
    "former_or_current_keeper": {
      "@id": "crm:P49_has_former_or_current_keeper",
      "@type": "@id",
      "@container": "@set"
    },
    "former_or_current_keeper_of": {
      "@id": "crm:P49i_is_former_or_current_keeper_of",
      "@type": "@id",
      "@container": "@set"
    },
    "current_custodian": {
      "@id": "crm:P50_has_current_keeper",
      "@type": "@id",
      "@container": "@set"
    },
    "current_custodian_of": {
      "@id": "crm:P50i_is_current_keeper_of",
      "@type": "@id",
      "@container": "@set"
    },
    "former_or_current_owner": {
      "@id": "crm:P51_has_former_or_current_owner",
      "@type": "@id",
      "@container": "@set"
    },
    "former_or_current_owner_of": {
      "@id": "crm:P51i_is_former_or_current_owner_of",
      "@type": "@id",
      "@container": "@set"
    },
    "current_owner": {
      "@id": "crm:P52_has_current_owner",
      "@type": "@id",
      "@container": "@set"
    },
    "current_owner_of": {
      "@id": "crm:P52i_is_current_owner_of",
      "@type": "@id",
      "@container": "@set"
    },
    "former_or_current_location": {
      "@id": "crm:P53_has_former_or_current_location",
      "@type": "@id",
      "@container": "@set"
    },
    "former_or_current_location_of": {
      "@id": "crm:P53i_is_former_or_current_location_of",
      "@type": "@id",
      "@container": "@set"
    },
    "current_permanent_location": {
      "@id": "crm:P54_has_current_permanent_location",
      "@type": "@id",
      "@container": "@set"
    },
    "current_permanent_location_of": {
      "@id": "crm:P54i_is_current_permanent_location_of",
      "@type": "@id",
      "@container": "@set"
    },
    "current_location": {
      "@id": "crm:P55_has_current_location",
      "@type": "@id"
    },
    "currently_holds": {
      "@id": "crm:P55i_currently_holds",
      "@type": "@id",
      "@container": "@set"
    },
    "bears": {
      "@id": "crm:P56_bears_feature",
      "@type": "@id",
      "@container": "@set"
    },
    "found_on": {
      "@id": "crm:P56i_is_found_on",
      "@type": "@id"
    },
    "number_of_parts": {
      "@id": "crm:P57_has_number_of_parts"
    },
    "section": {
      "@id": "crm:P59_has_section",
      "@type": "@id",
      "@container": "@set"
    },
    "located_on_or_within": {
      "@id": "crm:P59i_is_located_on_or_within",
      "@type": "@id",
      "@container": "@set"
    },
    "depicts": {
      "@id": "crm:P62_depicts",
      "@type": "@id",
      "@container": "@set"
    },
    "depicted_by": {
      "@id": "crm:P62i_is_depicted_by",
      "@type": "@id",
      "@container": "@set"
    },
    "shows": {
      "@id": "crm:P65_shows_visual_item",
      "@type": "@id",
      "@container": "@set"
    },
    "shown_by": {
      "@id": "crm:P65i_is_shown_by",
      "@type": "@id",
      "@container": "@set"
    },
    "refers_to": {
      "@id": "crm:P67_refers_to",
      "@type": "@id",
      "@container": "@set"
    },
    "referred_to_by": {
      "@id": "crm:P67i_is_referred_to_by",
      "@type": "@id",
      "@container": "@set"
    },
    "foresees_use_of": {
      "@id": "crm:P68_foresees_use_of",
      "@type": "@id",
      "@container": "@set"
    },
    "use_foreseen_by": {
      "@id": "crm:P68i_use_foreseen_by",
      "@type": "@id",
      "@container": "@set"
    },
    "associated_with": {
      "@id": "crm:P69_is_associated_with",
      "@type": "@id",
      "@container": "@set"
    },
    "documents": {
      "@id": "crm:P70_documents",
      "@type": "@id",
      "@container": "@set"
    },
    "documented_in": {
      "@id": "crm:P70i_is_documented_in",
      "@type": "@id",
      "@container": "@set"
    },
    "lists": {
      "@id": "crm:P71_lists",
      "@type": "@id",
      "@container": "@set"
    },
    "listed_in": {
      "@id": "crm:P71i_is_listed_in",
      "@type": "@id",
      "@container": "@set"
    },
    "language": {
      "@id": "crm:P72_has_language",
      "@type": "@id",
      "@container": "@set"
    },
    "language_of": {
      "@id": "crm:P72i_is_language_of",
      "@type": "@id",
      "@container": "@set"
    },
    "translation": {
      "@id": "crm:P73_has_translation",
      "@type": "@id",
      "@container": "@set"
    },
    "translation_of": {
      "@id": "crm:P73i_is_translation_of",
      "@type": "@id",
      "@container": "@set"
    },
    "residence": {
      "@id": "crm:P74_has_current_or_former_residence",
      "@type": "@id",
      "@container": "@set"
    },
    "current_or_former_residence_of": {
      "@id": "crm:P74i_is_current_or_former_residence_of",
      "@type": "@id",
      "@container": "@set"
    },
    "possesses": {
      "@id": "crm:P75_possesses",
      "@type": "@id",
      "@container": "@set"
    },
    "possessed_by": {
      "@id": "crm:P75i_is_possessed_by",
      "@type": "@id",
      "@container": "@set"
    },
    "contact_point": {
      "@id": "crm:P76_has_contact_point",
      "@type": "@id",
      "@container": "@set"
    },
    "provides_access_to": {
      "@id": "crm:P76i_provides_access_to",
      "@type": "@id",
      "@container": "@set"
    },
    "beginning_is_qualified_by": {
      "@id": "crm:P79_beginning_is_qualified_by"
    },
    "end_is_qualified_by": {
      "@id": "crm:P80_end_is_qualified_by"
    },
    "ongoing_throughout": {
      "@id": "crm:P81_ongoing_throughout"
    },
    "at_some_time_within": {
      "@id": "crm:P82_at_some_time_within"
    },
    "value": {
      "@id": "crm:P90_has_value"
    },
    "unit": {
      "@id": "crm:P91_has_unit",
      "@type": "@id"
    },
    "unit_of": {
      "@id": "crm:P91i_is_unit_of",
      "@type": "@id",
      "@container": "@set"
    },
    "brought_into_existence": {
      "@id": "crm:P92_brought_into_existence",
      "@type": "@id",
      "@container": "@set"
    },
    "brought_into_existence_by": {
      "@id": "crm:P92i_was_brought_into_existence_by",
      "@type": "@id"
    },
    "took_out_of_existence": {
      "@id": "crm:P93_took_out_of_existence",
      "@type": "@id",
      "@container": "@set"
    },
    "taken_out_of_existence_by": {
      "@id": "crm:P93i_was_taken_out_of_existence_by",
      "@type": "@id"
    },
    "created": {
      "@id": "crm:P94_has_created",
      "@type": "@id",
      "@container": "@set"
    },
    "created_by": {
      "@id": "crm:P94i_was_created_by",
      "@type": "@id"
    },
    "formed": {
      "@id": "crm:P95_has_formed",
      "@type": "@id",
      "@container": "@set"
    },
    "formed_by": {
      "@id": "crm:P95i_was_formed_by",
      "@type": "@id"
    },
    "by_mother": {
      "@id": "crm:P96_by_mother",
      "@type": "@id"
    },
    "gave_birth": {
      "@id": "crm:P96i_gave_birth",
      "@type": "@id",
      "@container": "@set"
    },
    "from_father": {
      "@id": "crm:P97_from_father",
      "@type": "@id",
      "@container": "@set"
    },
    "father_for": {
      "@id": "crm:P97i_was_father_for",
      "@type": "@id",
      "@container": "@set"
    },
    "brought_into_life": {
      "@id": "crm:P98_brought_into_life",
      "@type": "@id"
    },
    "born": {
      "@id": "crm:P98i_was_born",
      "@type": "@id"
    },
    "dissolved": {
      "@id": "crm:P99_dissolved",
      "@type": "@id"
    },
    "dissolved_by": {
      "@id": "crm:P99i_was_dissolved_by",
      "@type": "@id"
    },
    "death_of": {
      "@id": "crm:P100_was_death_of",
      "@type": "@id"
    },
    "died": {
      "@id": "crm:P100i_died_in",
      "@type": "@id"
    },
    "general_use": {
      "@id": "crm:P101_had_as_general_use",
      "@type": "@id",
      "@container": "@set"
    },
    "use_of": {
      "@id": "crm:P101i_was_use_of",
      "@type": "@id",
      "@container": "@set"
    },
    "title": {
      "@id": "crm:P102_has_title",
      "@type": "@id",
      "@container": "@set"
    },
    "title_of": {
      "@id": "crm:P102i_is_title_of",
      "@type": "@id"
    },
    "intended_for": {
      "@id": "crm:P103_was_intended_for",
      "@type": "@id",
      "@container": "@set"
    },
    "intention_of": {
      "@id": "crm:P103i_was_intention_of",
      "@type": "@id",
      "@container": "@set"
    },
    "subject_to": {
      "@id": "crm:P104_is_subject_to",
      "@type": "@id",
      "@container": "@set"
    },
    "applies_to": {
      "@id": "crm:P104i_applies_to",
      "@type": "@id",
      "@container": "@set"
    },
    "right_held_by": {
      "@id": "crm:P105_right_held_by",
      "@type": "@id",
      "@container": "@set"
    },
    "right_on": {
      "@id": "crm:P105i_has_right_on",
      "@type": "@id",
      "@container": "@set"
    },
    "produced": {
      "@id": "crm:P108_has_produced",
      "@type": "@id",
      "@container": "@set"
    },
    "produced_by": {
      "@id": "crm:P108i_was_produced_by",
      "@type": "@id"
    },
    "current_or_former_curator": {
      "@id": "crm:P109_has_current_or_former_curator",
      "@type": "@id",
      "@container": "@set"
    },
    "current_or_former_curator_of": {
      "@id": "crm:P109i_is_current_or_former_curator_of",
      "@type": "@id",
      "@container": "@set"
    },
    "augmented": {
      "@id": "crm:P110_augmented",
      "@type": "@id"
    },
    "augmented_by": {
      "@id": "crm:P110i_was_augmented_by",
      "@type": "@id",
      "@container": "@set"
    },
    "added": {
      "@id": "crm:P111_added",
      "@type": "@id"
    },
    "added_by": {
      "@id": "crm:P111i_was_added_by",
      "@type": "@id",
      "@container": "@set"
    },
    "diminished": {
      "@id": "crm:P112_diminished",
      "@type": "@id"
    },
    "diminished_by": {
      "@id": "crm:P112i_was_diminished_by",
      "@type": "@id",
      "@container": "@set"
    },
    "removed": {
      "@id": "crm:P113_removed",
      "@type": "@id"
    },
    "removed_by": {
      "@id": "crm:P113i_was_removed_by",
      "@type": "@id",
      "@container": "@set"
    },
    "overlaps_with": {
      "@id": "crm:P121_overlaps_with",
      "@type": "@id",
      "@container": "@set"
    },
    "borders_with": {
      "@id": "crm:P122_borders_with",
      "@type": "@id",
      "@container": "@set"
    },
    "resulted_in": {
      "@id": "crm:P123_resulted_in",
      "@type": "@id",
      "@container": "@set"
    },
    "resulted_from": {
      "@id": "crm:P123i_resulted_from",
      "@type": "@id",
      "@container": "@set"
    },
    "transformed": {
      "@id": "crm:P124_transformed",
      "@type": "@id",
      "@container": "@set"
    },
    "transformed_by": {
      "@id": "crm:P124i_was_transformed_by",
      "@type": "@id",
      "@container": "@set"
    },
    "used_object_of_type": {
      "@id": "crm:P125_used_object_of_type",
      "@type": "@id",
      "@container": "@set"
    },
    "type_of_object_used_in": {
      "@id": "crm:P125i_was_type_of_object_used_in",
      "@type": "@id",
      "@container": "@set"
    },
    "employed": {
      "@id": "crm:P126_employed",
      "@type": "@id",
      "@container": "@set"
    },
    "employed_in": {
      "@id": "crm:P126i_was_employed_in",
      "@type": "@id",
      "@container": "@set"
    },
    "carries": {
      "@id": "crm:P128_carries",
      "@type": "@id",
      "@container": "@set"
    },
    "carried_by": {
      "@id": "crm:P128i_is_carried_by",
      "@type": "@id",
      "@container": "@set"
    },
    "about": {
      "@id": "crm:P129_is_about",
      "@type": "@id",
      "@container": "@set"
    },
    "subject_of": {
      "@id": "crm:P129i_is_subject_of",
      "@type": "@id",
      "@container": "@set"
    },
    "shows_features_of": {
      "@id": "crm:P130_shows_features_of",
      "@type": "@id",
      "@container": "@set"
    },
    "features_are_also_found_on": {
      "@id": "crm:P130i_features_are_also_found_on",
      "@type": "@id",
      "@container": "@set"
    },
    "volume_overlaps_with": {
      "@id": "crm:P132_overlaps_with",
      "@type": "@id",
      "@container": "@set"
    },
    "distinct_from": {
      "@id": "crm:P133_is_separated_from",
      "@type": "@id",
      "@container": "@set"
    },
    "continued": {
      "@id": "crm:P134_continued",
      "@type": "@id",
      "@container": "@set"
    },
    "continued_by": {
      "@id": "crm:P134i_was_continued_by",
      "@type": "@id",
      "@container": "@set"
    },
    "created_type": {
      "@id": "crm:P135_created_type",
      "@type": "@id",
      "@container": "@set"
    },
    "type_created_by": {
      "@id": "crm:P135i_was_created_by",
      "@type": "@id",
      "@container": "@set"
    },
    "based_on": {
      "@id": "crm:P136_was_based_on",
      "@type": "@id",
      "@container": "@set"
    },
    "supported_type_creation": {
      "@id": "crm:P136i_supported_type_creation",
      "@type": "@id",
      "@container": "@set"
    },
    "exemplifies": {
      "@id": "crm:P137_exemplifies",
      "@type": "@id",
      "@container": "@set"
    },
    "exemplified_by": {
      "@id": "crm:P137i_is_exemplified_by",
      "@type": "@id",
      "@container": "@set"
    },
    "represents": {
      "@id": "crm:P138_represents",
      "@type": "@id",
      "@container": "@set"
    },
    "representation": {
      "@id": "crm:P138i_has_representation",
      "@type": "@id",
      "@container": "@set"
    },
    "alternative": {
      "@id": "crm:P139_has_alternative_form",
      "@type": "@id",
      "@container": "@set"
    },
    "assigned_to": {
      "@id": "crm:P140_assigned_attribute_to",
      "@type": "@id"
    },
    "attributed_by": {
      "@id": "crm:P140i_was_attributed_by",
      "@type": "@id",
      "@container": "@set"
    },
    "assigned": {
      "@id": "crm:P141_assigned",
      "@type": "@id",
      "@container": "@set"
    },
    "assigned_by": {
      "@id": "crm:P141i_was_assigned_by",
      "@type": "@id",
      "@container": "@set"
    },
    "used_constituent": {
      "@id": "crm:P142_used_constituent",
      "@type": "@id",
      "@container": "@set"
    },
    "used_in": {
      "@id": "crm:P142i_was_used_in",
      "@type": "@id",
      "@container": "@set"
    },
    "joined": {
      "@id": "crm:P143_joined",
      "@type": "@id"
    },
    "joined_by": {
      "@id": "crm:P143i_was_joined_by",
      "@type": "@id",
      "@container": "@set"
    },
    "joined_with": {
      "@id": "crm:P144_joined_with",
      "@type": "@id"
    },
    "gained_member_by": {
      "@id": "crm:P144i_gained_member_by",
      "@type": "@id",
      "@container": "@set"
    },
    "separated": {
      "@id": "crm:P145_separated",
      "@type": "@id"
    },
    "left_by": {
      "@id": "crm:P145i_left_by",
      "@type": "@id",
      "@container": "@set"
    },
    "separated_from": {
      "@id": "crm:P146_separated_from",
      "@type": "@id"
    },
    "lost_member_by": {
      "@id": "crm:P146i_lost_member_by",
      "@type": "@id",
      "@container": "@set"
    },
    "curated": {
      "@id": "crm:P147_curated",
      "@type": "@id",
      "@container": "@set"
    },
    "curated_by": {
      "@id": "crm:P147i_was_curated_by",
      "@type": "@id",
      "@container": "@set"
    },
    "c_part": {
      "@id": "crm:P148_has_component",
      "@type": "@id",
      "@container": "@set"
    },
    "c_part_of": {
      "@id": "crm:P148i_is_component_of",
      "@type": "@id",
      "@container": "@set"
    },
    "defines_typical_parts_of": {
      "@id": "crm:P150_defines_typical_parts_of",
      "@type": "@id",
      "@container": "@set"
    },
    "defines_typical_wholes_for": {
      "@id": "crm:P150i_defines_typical_wholes_for",
      "@type": "@id",
      "@container": "@set"
    },
    "formed_from": {
      "@id": "crm:P151_was_formed_from",
      "@type": "@id",
      "@container": "@set"
    },
    "participated_in_formation": {
      "@id": "crm:P151i_participated_in",
      "@type": "@id",
      "@container": "@set"
    },
    "parent": {
      "@id": "crm:P152_has_parent",
      "@type": "@id",
      "@container": "@set"
    },
    "parent_of": {
      "@id": "crm:P152i_is_parent_of",
      "@type": "@id",
      "@container": "@set"
    },
    "occupies": {
      "@id": "crm:P156_occupies",
      "@type": "@id",
      "@container": "@set"
    },
    "occupied_by": {
      "@id": "crm:P156i_is_occupied_by",
      "@type": "@id",
      "@container": "@set"
    },
    "at_rest_relative_to": {
      "@id": "crm:P157_is_at_rest_relative_to",
      "@type": "@id",
      "@container": "@set"
    },
    "provides_reference_space_for": {
      "@id": "crm:P157i_provides_reference_space_for",
      "@type": "@id",
      "@container": "@set"
    },
    "temporal_projection": {
      "@id": "crm:P160_has_temporal_projection",
      "@type": "@id",
      "@container": "@set"
    },
    "spatial_projection": {
      "@id": "crm:P161_has_spatial_projection",
      "@type": "@id",
      "@container": "@set"
    },
    "during": {
      "@id": "crm:P164_during",
      "@type": "@id",
      "@container": "@set"
    },
    "timespan_of_presence": {
      "@id": "crm:P164i_was_time-span_of",
      "@type": "@id",
      "@container": "@set"
    },
    "presence_of": {
      "@id": "crm:P165_incorporates",
      "@type": "@id",
      "@container": "@set"
    },
    "incorporated_by": {
      "@id": "crm:P165i_is_incorporated_in",
      "@type": "@id",
      "@container": "@set"
    },
    "a_presence_of": {
      "@id": "crm:P166_was_a_presence_of",
      "@type": "@id",
      "@container": "@set"
    },
    "presence": {
      "@id": "crm:P166i_had_presence",
      "@type": "@id",
      "@container": "@set"
    },
    "at": {
      "@id": "crm:P167_at",
      "@type": "@id",
      "@container": "@set"
    },
    "place_of": {
      "@id": "crm:P167i_was_place_of",
      "@type": "@id",
      "@container": "@set"
    },
    "defined_by": {
      "@id": "crm:P168_place_is_defined_by"
    },
    "spacetime_volume_is_defined_by": {
      "@id": "crm:P169i_spacetime_volume_is_defined_by"
    },
    "time_is_defined_by": {
      "@id": "crm:P170i_time_is_defined_by"
    },
    "at_some_place_within": {
      "@id": "crm:P171_at_some_place_within"
    },
    "spatially_contains": {
      "@id": "crm:P172_contains"
    },
    "starts_before_or_with_the_end_of": {
      "@id": "crm:P173_starts_before_or_with_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_after_or_with_the_start_of": {
      "@id": "crm:P173i_ends_after_or_with_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_before_the_end_of": {
      "@id": "crm:P174_starts_before_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_after_the_start_of": {
      "@id": "crm:P174i_ends_after_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_before_or_with_the_start_of": {
      "@id": "crm:P175_starts_before_or_with_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_with_or_after_the_start_of": {
      "@id": "crm:P175i_starts_with_or_after_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_before_the_start_of": {
      "@id": "crm:P176_starts_before_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_after_the_start_of": {
      "@id": "crm:P176i_starts_after_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "assigned_property": {
      "@id": "crm:P177_assigned_property_of_type",
      "@type": "@vocab"
    },
    "sales_price": {
      "@id": "crm:P179_had_sales_price",
      "@type": "@id",
      "@container": "@set"
    },
    "sales_price_of": {
      "@id": "crm:P179i_was_sales_price_of",
      "@type": "@id",
      "@container": "@set"
    },
    "currency": {
      "@id": "crm:P180_has_currency",
      "@type": "@id"
    },
    "currency_of": {
      "@id": "crm:P180i_was_currency_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_before_or_with_the_start_of": {
      "@id": "crm:P182_ends_before_or_with_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_after_or_with_the_end_of": {
      "@id": "crm:P182i_starts_after_or_with_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_before_the_start_of": {
      "@id": "crm:P183_ends_before_the_start_of",
      "@type": "@id",
      "@container": "@set"
    },
    "starts_after_the_end_of": {
      "@id": "crm:P183i_starts_after_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_before_or_with_the_end_of": {
      "@id": "crm:P184_ends_before_or_with_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_with_or_after_the_end_of": {
      "@id": "crm:P184i_ends_with_or_after_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_before_the_end_of": {
      "@id": "crm:P185_ends_before_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "ends_after_the_end_of": {
      "@id": "crm:P185i_ends_after_the_end_of",
      "@type": "@id",
      "@container": "@set"
    },
    "produced_thing_of_product_type": {
      "@id": "crm:P186_produced_thing_of_product_type",
      "@type": "@id"
    },
    "type_produced_by": {
      "@id": "crm:P186i_is_produced_by",
      "@type": "@id"
    },
    "production_plan": {
      "@id": "crm:P187_has_production_plan",
      "@type": "@id"
    },
    "production_plan_for": {
      "@id": "crm:P187i_is_production_plan_for",
      "@type": "@id"
    },
    "requires_production_tool": {
      "@id": "crm:P188_requires_production_tool",
      "@type": "@id"
    },
    "production_tool_for": {
      "@id": "crm:P188i_is_production_tool_for",
      "@type": "@id"
    },
    "approximates": {
      "@id": "crm:P189_approximates",
      "@type": "@id",
      "@container": "@set"
    },
    "approximated_by": {
      "@id": "crm:P189i_is_approximated_by",
      "@type": "@id",
      "@container": "@set"
    },
    "content": {
      "@id": "crm:P190_has_symbolic_content"
    },
    "duration": {
      "@id": "crm:P191_had_duration",
      "@type": "@id"
    },
    "duration_of": {
      "@id": "crm:P191i_was_duration_of",
      "@type": "@id"
    },
    "presence_of_thing": {
      "@id": "crm:P195_was_a_presence_of",
      "@type": "@id",
      "@container": "@set"
    },
    "thing_presence": {
      "@id": "crm:P195i_had_presence",
      "@type": "@id",
      "@container": "@set"
    },
    "defines": {
      "@id": "crm:P196_defines",
      "@type": "@id",
      "@container": "@set"
    },
    "thing_defined_by": {
      "@id": "crm:P196i_is_defined_by",
      "@type": "@id",
      "@container": "@set"
    },
    "covered_parts_of": {
      "@id": "crm:P197_covered_parts_of",
      "@type": "@id",
      "@container": "@set"
    },
    "partially_covered_by": {
      "@id": "crm:P197i_was_partially_covered_by",
      "@type": "@id",
      "@container": "@set"
    },
    "holds_or_supports": {
      "@id": "crm:P198_holds_or_supports",
      "@type": "@id",
      "@container": "@set"
    },
    "held_or_supported_by": {
      "@id": "crm:P198i_is_held_or_supported_by",
      "@type": "@id",
      "@container": "@set"
    },
    "represents_instance_of_type": {
      "@id": "crm:P199_represents_instance_of_type",
      "@type": "@id",
      "@container": "@set"
    },
    "instance_represented_by": {
      "@id": "crm:P199i_has_instance_represented_by",
      "@type": "@id",
      "@container": "@set"
    },
    "end_of_the_begin": {
      "@id": "crm:P81a_end_of_the_begin",
      "@type": "xsd:dateTime"
    },
    "begin_of_the_end": {
      "@id": "crm:P81b_begin_of_the_end",
      "@type": "xsd:dateTime"
    },
    "begin_of_the_begin": {
      "@id": "crm:P82a_begin_of_the_begin",
      "@type": "xsd:dateTime"
    },
    "end_of_the_end": {
      "@id": "crm:P82b_end_of_the_end",
      "@type": "xsd:dateTime"
    },
    "lower_value_limit": {
      "@id": "crm:P90a_has_lower_value_limit"
    },
    "upper_value_limit": {
      "@id": "crm:P90b_has_upper_value_limit"
    },
    "DigitalObject": {
      "@id": "dig:D1_Digital_Object"
    },
    "Encounter": {
      "@id": "sci:S19_Encounter_Event"
    },
    "caused": {
      "@id": "sci:O13_triggers",
      "@type": "@id",
      "@container": "@set"
    },
    "caused_by": {
      "@id": "sci:O13i_is_triggered_by",
      "@type": "@id",
      "@container": "@set"
    },
    "encountered": {
      "@id": "sci:O19_encountered_object",
      "@type": "@id",
      "@container": "@set"
    },
    "encountered_by": {
      "@id": "sci:O19i_was_object_encountered_at",
      "@type": "@id",
      "@container": "@set"
    },
    "AP25_occurs_during": {
      "@id": "archaeo:AP25_occurs_during",
      "@type": "@id",
      "@container": "@set"
    },
    "_label": {
      "@id": "rdfs:label"
    },
    "exact_match": {
      "@id": "skos:exactMatch",
      "@type": "@id",
      "@container": "@set"
    },
    "close_match": {
      "@id": "skos:closeMatch",
      "@type": "@id",
      "@container": "@set"
    },
    "narrower": {
      "@id": "skos:narrower",
      "@type": "@id",
      "@container": "@set"
    },
    "broader": {
      "@id": "skos:broader",
      "@type": "@id",
      "@container": "@set"
    },
    "hasTopConcept": {
      "@id": "skos:hasTopConcept",
      "@type": "@id",
      "@container": "@set"
    },
    "topConceptOf": {
      "@id": "skos:topConceptOf",
      "@type": "@id",
      "@container": "@set"
    },
    "inScheme": {
      "@id": "skos:inScheme",
      "@type": "@id",
      "@container": "@set"
    },
    "see_also": {
      "@id": "rdfs:seeAlso",
      "@type": "@id",
      "@container": "@set"
    },
    "conforms_to": {
      "@id": "dcterms:conformsTo",
      "@type": "@id",
      "@container": "@set"
    },
    "format": {
      "@id": "dc:format"
    },
    "Payment": {
      "@id": "la:Payment",
      "@context": {
        "part": {
          "@id": "crm:P9_consists_of",
          "@type": "@id",
          "@container": "@set"
        },
        "part_of": {
          "@id": "crm:P9i_forms_part_of",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "RightAcquisition": {
      "@id": "la:RightAcquisition"
    },
    "Phase": {
      "@id": "la:Phase"
    },
    "Set": {
      "@id": "la:Set",
      "@context": {
        "member": {
          "@id": "la:has_member",
          "@type": "@id",
          "@container": "@set"
        },
        "member_of": {
          "@id": "la:member_of",
          "@type": "@id",
          "@container": "@set"
        }
      }
    },
    "Addition": {
      "@id": "la:Addition"
    },
    "Removal": {
      "@id": "la:Removal"
    },
    "DigitalService": {
      "@id": "la:DigitalService"
    },
    "property_classified_as": {
      "@id": "la:property_classified_as",
      "@type": "@id",
      "@container": "@set"
    },
    "current_permanent_custodian": {
      "@id": "la:current_permanent_custodian",
      "@type": "@id"
    },
    "current_permanent_custodian_of": {
      "@id": "la:current_permanent_custodian_of",
      "@type": "@id",
      "@container": "@set"
    },
    "equivalent": {
      "@id": "la:equivalent",
      "@type": "@id",
      "@container": "@set"
    },
    "paid_amount": {
      "@id": "la:paid_amount",
      "@type": "@id"
    },
    "paid_from": {
      "@id": "la:paid_from",
      "@type": "@id",
      "@container": "@set"
    },
    "paid_to": {
      "@id": "la:paid_to",
      "@type": "@id",
      "@container": "@set"
    },
    "establishes": {
      "@id": "la:establishes",
      "@type": "@id"
    },
    "established_by": {
      "@id": "la:established_by",
      "@type": "@id"
    },
    "invalidates": {
      "@id": "la:invalidates",
      "@type": "@id",
      "@container": "@set"
    },
    "invalidated_by": {
      "@id": "la:invalidated_by",
      "@type": "@id"
    },
    "initiated": {
      "@id": "la:initiated",
      "@type": "@id",
      "@container": "@set"
    },
    "initiated_by": {
      "@id": "la:initiated_by",
      "@type": "@id",
      "@container": "@set"
    },
    "terminated": {
      "@id": "la:terminated",
      "@type": "@id",
      "@container": "@set"
    },
    "terminated_by": {
      "@id": "la:terminated_by",
      "@type": "@id",
      "@container": "@set"
    },
    "has_phase": {
      "@id": "la:has_phase",
      "@type": "@id",
      "@container": "@set"
    },
    "phase_of": {
      "@id": "la:phase_of",
      "@type": "@id"
    },
    "related_entity": {
      "@id": "la:related_entity",
      "@type": "@id"
    },
    "related_entity_of": {
      "@id": "la:related_entity_of",
      "@type": "@id",
      "@container": "@set"
    },
    "relationship": {
      "@id": "la:relationship",
      "@type": "@id"
    },
    "added_to": {
      "@id": "la:added_to",
      "@type": "@id"
    },
    "added_to_by": {
      "@id": "la:added_to_by",
      "@type": "@id",
      "@container": "@set"
    },
    "added_member": {
      "@id": "la:added_member",
      "@type": "@id"
    },
    "added_member_by": {
      "@id": "la:added_member_by",
      "@type": "@id",
      "@container": "@set"
    },
    "removed_from": {
      "@id": "la:removed_from",
      "@type": "@id"
    },
    "removed_from_by": {
      "@id": "la:removed_from_by",
      "@type": "@id",
      "@container": "@set"
    },
    "removed_member": {
      "@id": "la:removed_member",
      "@type": "@id"
    },
    "removed_member_by": {
      "@id": "la:removed_member_by",
      "@type": "@id",
      "@container": "@set"
    },
    "digitally_carries": {
      "@id": "la:digitally_carries",
      "@type": "@id",
      "@container": "@set"
    },
    "digitally_carried_by": {
      "@id": "la:digitally_carried_by",
      "@type": "@id",
      "@container": "@set"
    },
    "digitally_shows": {
      "@id": "la:digitally_shows",
      "@type": "@id",
      "@container": "@set"
    },
    "digitally_shown_by": {
      "@id": "la:digitally_shown_by",
      "@type": "@id",
      "@container": "@set"
    },
    "access_point": {
      "@id": "la:access_point",
      "@type": "@id",
      "@container": "@set"
    },
    "digitally_available_via": {
      "@id": "la:digitally_available_via",
      "@type": "@id",
      "@container": "@set"
    },
    "digitally_makes_available": {
      "@id": "la:digitally_makes_available",
      "@type": "@id",
      "@container": "@set"
    }
  }
}