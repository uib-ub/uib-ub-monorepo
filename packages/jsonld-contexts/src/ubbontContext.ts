const ubbontContext = {
  "@context": {
    "@version": 1.1,
    "muna": "http://muna.xyz/model/0.1/",
    "crm": "http://www.cidoc-crm.org/cidoc-crm/",
    "ecrm": "http://erlangen-crm.org/current/",
    "ubbont": "http://data.ub.uib.no/ontology/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "dbo": "http://dbpedia.org/ontology/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dct": "http://purl.org/dc/terms/",
    "schema": "http://schema.org/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "bibo": "http://purl.org/ontology/bibo/",
    "mo": "http://purl.org/ontology/mo/",
    "geo-deling": "http://vocab.lenka.no/geo-deling#",
    "wgs": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "dcmitype": "http://purl.org/dc/dcmitype/",
    "event": "http://purl.org/NET/c4dm/event.owl#",
    "geonames": "http://www.geonames.org/ontology#",
    "exif": "http://www.w3.org/2003/12/exif/ns#",
    "edm": "http://www.europeana.eu/schemas/edm/",
    "org": "http://www.w3.org/ns/org#",
    "bio": "http://purl.org/vocab/bio/0.1/",
    "frbr": "http://vocab.org/frbr/core#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "ore": "http://www.openarchives.org/ore/terms/",
    "nie": "http://www.semanticdesktop.org/ontologies/nie/#",
    "locah": "http://data.archiveshub.ac.uk/def/",
    "lexvo": "http://lexvo.org/ontology#",
    "cc": "http://creativecommons.org/ns#",
    "id": "@id",
    "type": "@type",
    "none": "@none",
    "_label": {
      "@id": "rdfs:label",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "spatialHierarchy": {
      "@id": "muna:spatialHierarchy",
      "@container": "@set"
    },
    "subjectOfManifest": {
      "@id": "muna:subjectOfManifest"
    },
    "image": {
      "@id": "muna:image"
    },
    "HumanMadeObject": {
      "@id": "crm:E22_Human-Made_Object"
    },
    "Production": {
      "@id": "crm:E12_Production"
    },
    "producedBy": {
      "@id": "crm:P108i_was_produced_by",
      "@type": "@id",
    },
    "carriedOutBy": {
      "@id": "crm::P14_carried_out_by",
      "@type": "@id",
    },
    "spatial": {
      "@id": "dct:spatial",
      "@type": "@id",
      "@container": "@set"
    },
    "birthName": {
      "@id": "dbo:birthName",
      "@type": "xsd:string"
    },
    "dateAccepted": {
      "@id": "dct:dateAccepted"
    },
    "physicalDescription": {
      "@id": "ubbont:physicalDescription",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "hasSMView": {
      "@id": "ubbont:hasSMView"
    },
    "abstract": {
      "@id": "dct:abstract",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "clause": {
      "@id": "ubbont:clause",
      "@type": "xsd:boolean"
    },
    "utm33": {
      "@id": "ubbont:utm33",
      "@type": "xsd:string"
    },
    "MultiVolumeBook": {
      "@id": "bibo:MultiVolumeBook"
    },
    "scopeNote": {
      "@id": "skos:scopeNote",
      "@type": "xsd:string"
    },
    "techniqueOf": {
      "@id": "ubbont:techniqueOf",
      "@type": "@id"
    },
    "acquiredFrom": {
      "@id": "ubbont:acquiredFrom",
      "@type": "@id"
    },
    "hasURI": {
      "@id": "ubbont:hasURI",
      "@type": "xsd:string"
    },
    "Attachment": {
      "@id": "ubbont:Attachment"
    },
    "Magazine": {
      "@id": "bibo:Magazine"
    },
    "shutterSpeedValue": {
      "@id": "exif:shutterSpeedValue"
    },
    "apertureValue": {
      "@id": "exif:apertureValue",
      "@type": "xsd:integer"
    },
    "Furniture": {
      "@id": "ubbont:Furniture"
    },
    "Copy": {
      "@id": "ubbont:Copy"
    },
    "owner": {
      "@id": "bibo:owner",
      "@type": "@id"
    },
    "Clause": {
      "@id": "ubbont:Clause"
    },
    "mergeWith": {
      "@id": "ubbont:mergeWith",
      "@type": "@id"
    },
    "timespan": {
      "@id": "ubbont:timespan",
    },
    "Telegram": {
      "@id": "ubbont:Telegram"
    },
    "created": {
      "@id": "dct:created",
      "@type": "xsd:date"
    },
    "EditedBook": {
      "@id": "bibo:EditedBook"
    },
    "yResolution": {
      "@id": "exif:yResolution",
      "@type": "xsd:integer"
    },
    "Painting": {
      "@id": "ubbont:Painting"
    },
    "pageStart": {
      "@id": "bibo:pageStart",
      "@type": "xsd:integer"
    },
    "beginOfTheBegin": {
      "@id": "crm:beginOfTheBegin"
    },
    "endOfTheBegin": {
      "@id": "crm:endOfTheBegin"
    },
    "beginOfTheEnd": {
      "@id": "crm:beginOfTheEnd"
    },
    "endOfTheEnd": {
      "@id": "crm:endfTheEnd"
    },
    "edtf": {
      "@id": "muna:edtf"
    },
    "E9_Move": {
      "@id": "ecrm:E9_Move"
    },
    "ShareCertificate": {
      "@id": "ubbont:ShareCertificate"
    },
    "isNextInSequence": {
      "@id": "edm:isNextInSequence",
      "@type": "@id"
    },
    "profession": {
      "@id": "dbo:profession",
      "@type": "xsd:string"
    },
    "CopyBook": {
      "@id": "ubbont:CopyBook"
    },
    "width": {
      "@id": "ubbont:width"
    },
    "P27_moved_from": {
      "@id": "ecrm:P27_moved_from",
      "@type": "@id"
    },
    "nextPage": {
      "@id": "ubbont:nextPage",
      "@type": "@id"
    },
    "CircularLetter": {
      "@id": "ubbont:CircularLetter"
    },
    "hiddenLabel": {
      "@id": "skos:hiddenLabel",
      "@type": "xsd:string"
    },
    "license": {
      "@id": "dct:license",
      "@type": "@id"
    },
    "locationFor": {
      "@id": "ubbont:locationFor",
      "@type": "@id"
    },
    "hasPermantentLocation": {
      "@id": "ubbont:hasPermantentLocation",
      "@type": "@id"
    },
    "WebResource": {
      "@id": "edm:WebResource"
    },
    "ProvenanceStatement": {
      "@id": "dct:ProvenanceStatement"
    },
    "FurnitureSubSubSection": {
      "@id": "ubbont:FurnitureSubSubSection"
    },
    "made": {
      "@id": "foaf:made",
      "@type": "@id"
    },
    "commissionedBy": {
      "@id": "ubbont:commissionedBy",
      "@type": "@id"
    },
    "priority": {
      "@id": "ubbont:workflow/priority"
    },
    "img": {
      "@id": "foaf:img",
      "@type": "xsd:string"
    },
    "Vidisse": {
      "@id": "ubbont:Vidisse"
    },
    "Country": {
      "@id": "schema:Country"
    },
    "relatedTo": {
      "@id": "schema:relatedTo",
      "@type": "@id"
    },
    "Vessel": {
      "@id": "ubbont:Vessel"
    },
    "pageEnd": {
      "@id": "bibo:pageEnd",
      "@type": "xsd:integer"
    },
    "originalCreatorOf": {
      "@id": "ubbont:originalCreatorOf",
      "@type": "@id"
    },
    "Translation": {
      "@id": "ubbont:Translation"
    },
    "biography": {
      "@id": "bio:biography",
      "@type": "xsd:string"
    },
    "model": {
      "@id": "exif:model",
      "@type": "xsd:string"
    },
    "Organization": {
      "@id": "foaf:Organization"
    },
    "issued": {
      "@id": "dct:issued"
    },
    "secondarySupport": {
      "@id": "ubbont:secondarySupport",
      "@type": "@id"
    },
    "Button": {
      "@id": "ubbont:Button"
    },
    "MortageDeed": {
      "@id": "ubbont:MortageDeed"
    },
    "temporaryLocationOf": {
      "@id": "ubbont:temporaryLocationOf",
      "@type": "@id"
    },
    "issue": {
      "@id": "bibo:issue",
      "@type": "xsd:integer"
    },
    "isDigitized": {
      "@id": "ubbont:isDigitized",
      "@type": "xsd:boolean"
    },
    "cataloguer": {
      "@id": "ubbont:cataloguer",
      "@type": "@id"
    },
    "references": {
      "@id": "dct:references",
      "@container": [
        "@set",
        "@language"
      ]
    },
    "Room": {
      "@id": "ubbont:Room"
    },
    "Proceedings": {
      "@id": "bibo:Proceedings"
    },
    "isReplacedBy": {
      "@id": "dct:isReplacedBy",
      "@type": "@id"
    },
    "Speech": {
      "@id": "ubbont:Speech"
    },
    "isSubjectOf": {
      "@id": "ubbont:isSubjectOf",
      "@type": "@id"
    },
    "height": {
      "@id": "ubbont:height"
    },
    "Note": {
      "@id": "bibo:Note"
    },
    "receivedFrom": {
      "@id": "ubbont:receivedFrom",
      "@type": "@id"
    },
    "hasBeenMergedWith": {
      "@id": "ubbont:hasBeenMergedWith",
    },
    "pages": {
      "@id": "bibo:pages",
      "@type": "xsd:integer"
    },
    "place": {
      "@id": "event:place",
      "@type": "@id",
      "@container": "@set"
    },
    "isShownAt": {
      "@id": "edm:isShownAt",
      "@type": "@id"
    },
    "SaleDeed": {
      "@id": "ubbont:SaleDeed"
    },
    "Publisher": {
      "@id": "ubbont:Publisher"
    },
    "Trash": {
      "@id": "ubbont:Trash"
    },
    "Workshop": {
      "@id": "bibo:Workshop"
    },
    "viafID": {
      "@id": "ubbont:viafID"
    },
    "hasVersion": {
      "@id": "dct:hasVersion",
      "@type": "@id"
    },
    "Grunneiendom": {
      "@id": "geo-deling:Grunneiendom"
    },
    "Memorandum": {
      "@id": "ubbont:Memorandum"
    },
    "formerOwnerOf": {
      "@id": "ubbont:formerOwnerOf",
      "@type": "@id"
    },
    "depiction": {
      "@id": "foaf:depiction",
      "@type": "@id"
    },
    "Object": {
      "@id": "ubbont:Object"
    },
    "Map": {
      "@id": "bibo:Map"
    },
    "Deed": {
      "@id": "ubbont:Deed"
    },
    "Album": {
      "@id": "ubbont:Album"
    },
    "Monument": {
      "@id": "ubbont:Monument"
    },
    "whiteBalance": {
      "@id": "exif:whiteBalance"
    },
    "maker": {
      "@id": "foaf:maker",
      "@type": "@id",
      "@container": "@set"
    },
    "P25_moved": {
      "@id": "ecrm:P25_moved",
      "@type": "@id"
    },
    "honorificPrefix": {
      "@id": "schema:honorificPrefix",
      "@type": "xsd:string"
    },
    "deathPlace": {
      "@id": "dbo:deathPlace",
      "@type": "@id"
    },
    "displayLabel": {
      "@id": "ubbont:displayLabel"
    },
    "parentADM1": {
      "@id": "geonames:parentADM1",
      "@type": "@id"
    },
    "Supplication": {
      "@id": "ubbont:Supplication"
    },
    "long": {
      "@id": "wgs:long",
      "@type": "xsd:double"
    },
    "UserGenereatedContent": {
      "@id": "ubbont:UserGenereatedContent"
    },
    "deathDate": {
      "@id": "dbo:deathDate"
    },
    "altLabel": {
      "@id": "skos:altLabel",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "Parish": {
      "@id": "ubbont:Parish"
    },
    "PressClipping": {
      "@id": "ubbont:PressClipping"
    },
    "CatalogueCard": {
      "@id": "ubbont:CatalogueCard"
    },
    "contains": {
      "@id": "ubbont:contains",
      "@type": "@id"
    },
    "Receipt": {
      "@id": "ubbont:Receipt"
    },
    "narrower": {
      "@id": "skos:narrower",
      "@type": "@id"
    },
    "Kommune": {
      "@id": "geo-deling:Kommune"
    },
    "subOrganizationOf": {
      "@id": "org:subOrganizationOf",
      "@type": "@id"
    },
    "isPartOf": {
      "@id": "dct:isPartOf",
      "@type": "@id",
      "@container": "@set"
    },
    "P27i_was_origin_of": {
      "@id": "ecrm:P27i_was_origin_of",
      "@type": "@id"
    },
    "editorOf": {
      "@id": "ubbont:editorOf",
      "@type": "@id"
    },
    "parent": {
      "@id": "schema:parent",
      "@type": "@id"
    },
    "DoctoralThesis": {
      "@id": "ubbont:DoctoralThesis"
    },
    "children": {
      "@id": "schema:children",
      "@type": "@id"
    },
    "mbox": {
      "@id": "foaf:mbox",
      "@type": "xsd:string"
    },
    "BookOfMinutes": {
      "@id": "ubbont:BookOfMinutes"
    },
    "hasPart": {
      "@id": "dct:hasPart",
      "@type": "@id"
    },
    "Concept": {
      "@id": "skos:Concept"
    },
    "recipient": {
      "@id": "bibo:recipient",
      "@type": "@id"
    },
    "focus": {
      "@id": "foaf:focus",
      "@type": "@id"
    },
    "Bill": {
      "@id": "ubbont:Bill"
    },
    "Contract": {
      "@id": "ubbont:Contract"
    },
    "related": {
      "@id": "skos:related",
      "@type": "@id"
    },
    "familyName": {
      "@id": "foaf:familyName",
      "@type": "xsd:string"
    },
    "measurement": {
      "@id": "ubbont:measurement",
      "@type": "@id"
    },
    "sibling": {
      "@id": "schema:sibling",
      "@type": "@id"
    },
    "superEvent": {
      "@id": "schema:superEvent",
      "@type": "@id",
      "@container": "@set"
    },
    "subEvent": {
      "@id": "schema:subEvent",
      "@type": "@id",
      "@container": "@set"
    },
    "StorageUnit": {
      "@id": "ubbont:StorageUnit"
    },
    "Measurement": {
      "@id": "ubbont:Measurement"
    },
    "permantentLocationOf": {
      "@id": "ubbont:permantentLocationOf",
      "@type": "@id"
    },
    "Location": {
      "@id": "ubbont:Location"
    },
    "LivingImage": {
      "@id": "dcmitype:LivingImage"
    },
    "containedIn": {
      "@id": "ubbont:containedIn",
      "@type": "@id"
    },
    "tertiarySupport": {
      "@id": "ubbont:tertiarySupport",
      "@type": "@id"
    },
    "acquired": {
      "@id": "ubbont:acquired",
      "@type": "@id"
    },
    "transcriptOf": {
      "@id": "bibo:transcriptOf",
      "@type": "@id"
    },
    "invertedName": {
      "@id": "ubbont:invertedName",
      "@type": "xsd:string"
    },
    "P55i_currently_holds": {
      "@id": "ecrm:P55i_currently_holds",
      "@type": "@id"
    },
    "Fragment": {
      "@id": "ubbont:Fragment"
    },
    "sourceFile": {
      "@id": "ubbont:sourceFile"
    },
    "currentPermanentLocation": {
      "@id": "ubbont:currentPermanentLocation",
      "@type": "@id"
    },
    "createdYear": {
      "@id": "ubbont:createdYear"
    },
    "FinancialStatement": {
      "@id": "ubbont:FinancialStatement"
    },
    "AcademicArticle": {
      "@id": "bibo:AcademicArticle"
    },
    "gender": {
      "@id": "foaf:gender"
    },
    "homepage": {
      "@id": "foaf:homepage",
      "@type": "@id"
    },
    "CashBook": {
      "@id": "ubbont:CashBook"
    },
    "email": {
      "@id": "schema:email"
    },
    "Event": {
      "@id": "event:Event"
    },
    "Ship": {
      "@id": "ubbont:Ship"
    },
    "exactMatch": {
      "@id": "skos:exactMatch",
      "@type": "@id"
    },
    "parentADM2": {
      "@id": "geonames:parentADM2",
      "@type": "@id"
    },
    "parentCountry": {
      "@id": "geonames:parentCountry",
      "@type": "@id"
    },
    "sequenceNr": {
      "@id": "ubbont:sequenceNr",
      "@type": "xsd:integer"
    },
    "hasTranslation": {
      "@id": "ubbont:hasTranslation",
      "@type": "@id"
    },
    "Transcription": {
      "@id": "ubbont:Transcription"
    },
    "fylkenr": {
      "@id": "geo-deling:fylkenr",
      "@type": "xsd:integer"
    },
    "Person": {
      "@id": "foaf:Person"
    },
    "based_near": {
      "@id": "foaf:based_near",
      "@type": "@id"
    },
    "Priority": {
      "@id": "ubbont:workflow/Priority"
    },
    "Advertisement": {
      "@id": "ubbont:Advertisement"
    },
    "note": {
      "@id": "skos:note",
      "@type": "xsd:string"
    },
    "rightsHolder": {
      "@id": "dct:rightsHolder",
      "@type": "@id"
    },
    "placeDelivery": {
      "@id": "ubbont:placeDelivery",
      "@type": "@id"
    },
    "pseudonym": {
      "@id": "dbo:pseudonym",
      "@type": "xsd:string"
    },
    "formLabel": {
      "@id": "ubbont:formLabel",
      "@type": "xsd:string"
    },
    "P55_has_current_location": {
      "@id": "ecrm:P55_has_current_location",
      "@type": "@id"
    },
    "Cantata": {
      "@id": "ubbont:Cantata"
    },
    "MusicalWork": {
      "@id": "dbo:MusicalWork"
    },
    "producedIn": {
      "@id": "event:producedIn",
      "@type": "@id"
    },
    "notation": {
      "@id": "skos:notation"
    },
    "hasPage": {
      "@id": "ubbont:hasPage",
      "@type": "@id"
    },
    "Report": {
      "@id": "bibo:Report"
    },
    "hasRepresentation": {
      "@id": "ubbont:hasRepresentation",
      "@type": "@id"
    },
    "product": {
      "@id": "event:product",
      "@type": "@id",
      "@container": "@set"
    },
    "Book": {
      "@id": "bibo:Book"
    },
    "ownedBy": {
      "@id": "ubbont:ownedBy",
      "@type": "@id",
      "@container": "@set"
    },
    "Agent": {
      "@id": "foaf:Agent"
    },
    "Ticket": {
      "@id": "ubbont:Ticket"
    },
    "P26_moved_to": {
      "@id": "ecrm:P26_moved_to",
      "@type": "@id"
    },
    "Box": {
      "@id": "ubbont:Box"
    },
    "madeAfter": {
      "@id": "ubbont:madeAfter",
      "@type": "xsd:date"
    },
    "hasSource": {
      "@id": "ubbont:hasSource",
      "@type": "@id"
    },
    "name": {
      "@id": "foaf:name",
      "@type": "xsd:string"
    },
    "postalCode": {
      "@id": "schema:postalCode",
      "@type": "xsd:integer"
    },
    "Technique": {
      "@id": "ubbont:Technique"
    },
    "acquiredIn": {
      "@id": "ubbont:acquiredIn",
      "@type": "@id"
    },
    "Drawing": {
      "@id": "ubbont:Drawing"
    },
    "T-Shirt": {
      "@id": "ubbont:T-Shirt"
    },
    "Building": {
      "@id": "ubbont:Building"
    },
    "uuid": {
      "@id": "ubbont:uuid"
    },
    "Article": {
      "@id": "bibo:Article"
    },
    "Mark": {
      "@id": "ubbont:Mark"
    },
    "Circulaire": {
      "@id": "ubbont:Circulaire"
    },
    "published": {
      "@id": "ubbont:published",
      "@type": "@id"
    },
    "hasMember": {
      "@id": "org:hasMember",
      "@type": "@id"
    },
    "Manuscript": {
      "@id": "bibo:Manuscript"
    },
    "userDate": {
      "@id": "ubbont:userDate"
    },
    "showWeb": {
      "@id": "ubbont:showWeb",
      "@type": "xsd:boolean"
    },
    "location": {
      "@id": "wgs:location",
      "@type": "@id"
    },
    "isSourceOf": {
      "@id": "ubbont:isSourceOf",
      "@type": "@id"
    },
    "Postcard": {
      "@id": "ubbont:Postcard"
    },
    "Issue": {
      "@id": "bibo:Issue"
    },
    "Booklet": {
      "@id": "ubbont:Booklet"
    },
    "typeOfDamage": {
      "@id": "ubbont:typeOfDamage"
    },
    "originalCreator": {
      "@id": "ubbont:originalCreator",
      "@type": "@id"
    },
    "madeBefore": {
      "@id": "ubbont:madeBefore",
      "@type": "xsd:date"
    },
    "MasterThesis": {
      "@id": "ubbont:MasterThesis"
    },
    "Form": {
      "@id": "ubbont:Form"
    },
    "rights": {
      "@id": "dct:rights",
      "@type": "xsd:string"
    },
    "birthYear": {
      "@id": "dbo:birthYear",
      "@type": "xsd:gYear"
    },
    "technique": {
      "@id": "ubbont:technique",
      "@type": "@id",
      "@container": "@set"
    },
    "Family": {
      "@id": "ubbont:Family"
    },
    "PrayerBook": {
      "@id": "ubbont:PrayerBook"
    },
    "PhotographicTechnique": {
      "@id": "ubbont:PhotographicTechnique"
    },
    "Work": {
      "@id": "frbr:Work"
    },
    "deathYear": {
      "@id": "dbo:deathYear",
      "@type": "xsd:gYear"
    },
    "firstName": {
      "@id": "foaf:firstName",
      "@type": "xsd:string"
    },
    "alt": {
      "@id": "wgs:alt"
    },
    "clauseFor": {
      "@id": "ubbont:clauseFor",
      "@type": "@id"
    },
    "rodeNr": {
      "@id": "ubbont:rodeNr"
    },
    "identifier": {
      "@id": "dct:identifier"
    },
    "Protocol": {
      "@id": "ubbont:Protocol"
    },
    "Poster": {
      "@id": "ubbont:Poster"
    },
    "Company": {
      "@id": "dbo:Company"
    },
    "gnr": {
      "@id": "geo-deling:gnr",
      "@type": "xsd:integer"
    },
    "deprecated": {
      "@id": "owl:deprecated"
    },
    "Photograph": {
      "@id": "ubbont:Photograph"
    },
    "subject": {
      "@id": "dct:subject",
      "@type": "@id",
      "@container": "@set"
    },
    "Page": {
      "@id": "ubbont:Page"
    },
    "commissioned": {
      "@id": "ubbont:commissioned",
      "@type": "@id",
      "@container": "@set"
    },
    "internalLocation": {
      "@id": "ubbont:internalLocation",
      "@type": "xsd:string"
    },
    "depicts": {
      "@id": "foaf:depicts",
      "@type": "@id",
      "@container": "@set"
    },
    "locationType": {
      "@id": "ubbont:locationType"
    },
    "birthPlace": {
      "@id": "dbo:birthPlace",
      "@type": "@id"
    },
    "hasMDView": {
      "@id": "ubbont:hasMDView"
    },
    "spouse": {
      "@id": "schema:spouse",
      "@type": "@id"
    },
    "hasTimeline": {
      "@id": "ubbont:hasTimeline",
      "@type": "xsd:string"
    },
    "Aggregation": {
      "@id": "ore:Aggregation"
    },
    "dateOfAcquisition": {
      "@id": "ubbont:dateOfAcquisition"
    },
    "Point": {
      "@id": "wgs:Point"
    },
    "definition": {
      "@id": "skos:definition",
      "@type": "xsd:string"
    },
    "knows": {
      "@id": "schema:knows",
      "@type": "@id"
    },
    "editorialNote": {
      "@id": "skos:editorialNote",
      "@type": "xsd:string"
    },
    "Workflow": {
      "@id": "ubbont:workflow/Workflow"
    },
    "honorificSuffix": {
      "@id": "schema:honorificSuffix",
      "@type": "xsd:string"
    },
    "isLocationFor": {
      "@id": "ubbont:isLocationFor",
      "@type": "@id"
    },
    "P25i_moved_by": {
      "@id": "ecrm:P25i_moved_by",
      "@type": "@id"
    },
    "Cataloguer": {
      "@id": "ubbont:Cataloguer"
    },
    "Minutes": {
      "@id": "ubbont:Minutes"
    },
    "hasTHView": {
      "@id": "ubbont:hasTHView"
    },
    "stores": {
      "@id": "ubbont:stores",
      "@type": "@id"
    },
    "ConceptScheme": {
      "@id": "skos:ConceptScheme"
    },
    "ResourceType": {
      "@id": "ubbont:ResourceType"
    },
    "Flyer": {
      "@id": "ubbont:Flyer"
    },
    "ProxyCollection": {
      "@id": "ubbont:ProxyCollection"
    },
    "primarySupport": {
      "@id": "ubbont:primarySupport",
      "@type": "@id"
    },
    "ShipsLog": {
      "@id": "ubbont:ShipsLog"
    },
    "reference": {
      "@id": "ubbont:reference",
    },
    "GraphicArt": {
      "@id": "ubbont:GraphicArt"
    },
    "featured": {
      "@id": "ubbont:featured",
      "@type": "xsd:boolean"
    },
    "gabNr": {
      "@id": "ubbont:gabNr"
    },
    "streetAddress": {
      "@id": "schema:streetAddress",
      "@type": "xsd:string"
    },
    "title": {
      "@id": "dct:title",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "Bestallingsbrev": {
      "@id": "ubbont:Bestallingsbrev"
    },
    "issn": {
      "@id": "bibo:issn"
    },
    "FurnitureSubSection": {
      "@id": "ubbont:FurnitureSubSection"
    },
    "dateSubmitted": {
      "@id": "dct:dateSubmitted"
    },
    "polygon": {
      "@id": "ubbont:polygon",
      "@type": "xsd:string"
    },
    "Passport": {
      "@id": "ubbont:Passport"
    },
    "transcriptionOf": {
      "@id": "ubbont:transcriptionOf",
      "@type": "@id"
    },
    "xResolution": {
      "@id": "exif:xResolution",
      "@type": "xsd:integer"
    },
    "placeOfPublication": {
      "@id": "ubbont:placeOfPublication",
      "@type": "@id"
    },
    "birthDate": {
      "@id": "dbo:birthDate"
    },
    "publisher": {
      "@id": "dct:publisher",
      "@type": "@id"
    },
    "userPoint": {
      "@id": "ubbont:userPoint"
    },
    "DegreeCertificate": {
      "@id": "ubbont:DegreeCertificate"
    },
    "kulturnavId": {
      "@id": "ubbont:kulturnavId"
    },
    "lat": {
      "@id": "wgs:lat",
      "@type": "xsd:double"
    },
    "originPlace": {
      "@id": "ubbont:originPlace",
      "@type": "@id"
    },
    "relatedWebPage": {
      "@id": "ubbont:relatedWebPage",
      "@type": "xsd:string"
    },
    "previousPage": {
      "@id": "ubbont:previousPage",
      "@type": "@id"
    },
    "FurnitureSection": {
      "@id": "ubbont:FurnitureSection"
    },
    "Exhibition": {
      "@id": "ubbont:Exhibition"
    },
    "hasThumbnail": {
      "@id": "ubbont:hasThumbnail",
    },
    "catalogueStatus": {
      "@id": "ubbont:catalogueStatus"
    },
    "_modified": {
      "@id": "dct:modified",
      "@type": "xsd:dateTime"
    },
    "provenance": {
      "@id": "dct:provenance",
      "@type": "@id"
    },
    "reciever": {
      "@id": "bibo:reciever",
      "@type": "@id"
    },
    "Thesis": {
      "@id": "ubbont:Thesis"
    },
    "publishedYear": {
      "@id": "ubbont:publishedYear",
      "@type": "xsd:gYear"
    },
    "accessProvidedBy": {
      "@id": "locah:accessProvidedBy",
      "@type": "@id"
    },
    "PhysicalDescription": {
      "@id": "ubbont:PhysicalDescription"
    },
    "mainImage": {
      "@id": "ubbont:mainImage",
      "@type": "xsd:boolean"
    },
    "volume": {
      "@id": "bibo:volume",
      "@type": "xsd:integer"
    },
    "Fylke": {
      "@id": "geo-deling:Fylke"
    },
    "topConceptOf": {
      "@id": "skos:topConceptOf",
      "@type": "@id"
    },
    "userTag": {
      "@id": "ubbont:userTag"
    },
    "isReferencedBy": {
      "@id": "dct:isReferencedBy",
      "@type": "@id"
    },
    "isRightsHolderOf": {
      "@id": "ubbont:isRightsHolderOf",
      "@type": "@id"
    },
    "logo": {
      "@id": "foaf:logo",
      "@type": "xsd:string"
    },
    "MotifType": {
      "@id": "ubbont:MotifType"
    },
    "DigitalResource": {
      "@id": "ubbont:DigitalResource"
    },
    "date": {
      "@id": "dct:date"
    },
    "Series": {
      "@id": "bibo:Series"
    },
    "motifTypeOf": {
      "@id": "ubbont:motifTypeOf",
      "@type": "@id"
    },
    "WrittenWork": {
      "@id": "ubbont:WrittenWork"
    },
    "replaces": {
      "@id": "dct:replaces",
      "@type": "@id"
    },
    "Periodical": {
      "@id": "bibo:Periodical"
    },
    "Newspaper": {
      "@id": "bibo:Newspaper"
    },
    "WorkList": {
      "@id": "ubbont:WorkList"
    },
    "Language": {
      "@id": "lexvo:Language"
    },
    "broader": {
      "@id": "skos:broader",
      "@type": "@id"
    },
    "flash": {
      "@id": "exif:flash",
      "@type": "xsd:integer"
    },
    "bibsysID": {
      "@id": "ubbont:bibsysID",
    },
    "internalNote": {
      "@id": "ubbont:internalNote",
    },
    "Programme": {
      "@id": "ubbont:Programme"
    },
    "fileSize": {
      "@id": "schema:fileSize"
    },
    "formerOwner": {
      "@id": "ubbont:formerOwner",
      "@type": "@id"
    },
    "Will": {
      "@id": "ubbont:Will"
    },
    "translationOf": {
      "@id": "ubbont:translationOf",
      "@type": "@id"
    },
    "LandSurvey": {
      "@id": "ubbont:LandSurvey"
    },
    "Diary": {
      "@id": "ubbont:Diary"
    },
    "JourneyLog": {
      "@id": "ubbont:JourneyLog"
    },
    "hasSubOrganization": {
      "@id": "org:hasSubOrganization",
      "@type": "@id"
    },
    "Acquisition": {
      "@id": "ubbont:Acquisition"
    },
    "mimeType": {
      "@id": "nie:mimeType",
      "@type": "xsd:string"
    },
    "addressLocality": {
      "@id": "schema:addressLocality",
      "@type": "xsd:string"
    },
    "SpatialThing": {
      "@id": "wgs:SpatialThing"
    },
    "Brochure": {
      "@id": "ubbont:Brochure"
    },
    "extinctionYear": {
      "@id": "dbo:extinctionYear"
    },
    "Seal": {
      "@id": "ubbont:Seal"
    },
    "kommunenr": {
      "@id": "geo-deling:kommunenr",
      "@type": "xsd:integer"
    },
    "WindowDisplay": {
      "@id": "ubbont:WindowDisplay"
    },
    "memberOf": {
      "@id": "org:memberOf",
      "@type": "@id"
    },
    "extinctionDate": {
      "@id": "dbo:extinctionDate",
      "@type": "xsd:date"
    },
    "ExLibris": {
      "@id": "ubbont:ExLibris"
    },
    "comment": {
      "@id": "rdfs:comment"
    },
    "hasClause": {
      "@id": "ubbont:hasClause",
      "@type": "@id"
    },
    "isShownBy": {
      "@id": "ubbont:isShownBy",
      "@type": "@id"
    },
    "Image": {
      "@id": "dct:Image"
    },
    "Document": {
      "@id": "bibo:Document"
    },
    "resourceType": {
      "@id": "ubbont:resourceType",
      "@type": "@id"
    },
    "License": {
      "@id": "cc:License"
    },
    "language": {
      "@id": "dct:language",
      "@type": "@id"
    },
    "quality": {
      "@id": "ubbont:quality"
    },
    "reproduced": {
      "@id": "ubbont:reproduced",
      "@type": "@id"
    },
    "focalLength": {
      "@id": "exif:focalLength"
    },
    "Lyrics": {
      "@id": "mo:Lyrics"
    },
    "page": {
      "@id": "foaf:page",
      "@type": "@id"
    },
    "hasXLView": {
      "@id": "ubbont:hasXLView"
    },
    "reproducedBy": {
      "@id": "ubbont:reproducedBy",
      "@type": "@id"
    },
    "sender": {
      "@id": "ubbont:sender",
      "@type": "@id"
    },
    "formationYear": {
      "@id": "dbo:formationYear"
    },
    "isoSpeedRatings": {
      "@id": "exif:isoSpeedRatings"
    },
    "currentTemporaryLocation": {
      "@id": "ubbont:currentTemporaryLocation",
      "@type": "@id"
    },
    "storedAt": {
      "@id": "ubbont:storedAt",
      "@type": "@id"
    },
    "isRepresentationOf": {
      "@id": "ubbont:isRepresentationOf",
      "@type": "@id"
    },
    "hasTemporaryLocation": {
      "@id": "ubbont:hasTemporaryLocation",
      "@type": "@id"
    },
    "hasView": {
      "@id": "ubbont:hasView"
    },
    "_available": {
      "@id": "dct:available",
      "@type": "xsd:date"
    },
    "userPlace": {
      "@id": "ubbont:userPlace"
    },
    "hasLGView": {
      "@id": "ubbont:hasLGView"
    },
    "previousIdentifier": {
      "@id": "ubbont:previousIdentifier"
    },
    "motifType": {
      "@id": "ubbont:motifType",
      "@type": "@id"
    },
    "extent": {
      "@id": "dct:extent"
    },
    "alternative": {
      "@id": "dct:alternative",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "Conference": {
      "@id": "bibo:Conference"
    },
    "Journal": {
      "@id": "ubbont:Journal"
    },
    "hasLocation": {
      "@id": "ubbont:hasLocation",
      "@type": "@id"
    },
    "Reference": {
      "@id": "ubbont:Reference"
    },
    "bruksnavn": {
      "@id": "ubbont:bruksnavn",
      "@type": "xsd:string"
    },
    "acqusitionType": {
      "@id": "ubbont:acqusitionType"
    },
    "parentFeature": {
      "@id": "geonames:parentFeature",
      "@type": "@id"
    },
    "Sigil": {
      "@id": "ubbont:Sigil"
    },
    "endOdTheEnd": {
      "@id": "ubbont:end"
    },
    "hasTranscript": {
      "@id": "ubbont:hasTranscript",
      "@type": "@id"
    },
    "hasTopConcept": {
      "@id": "skos:hasTopConcept",
      "@type": "@id",
      "@container": "@set"
    },
    "prefLabel": {
      "@id": "skos:prefLabel",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "formationDate": {
      "@id": "dbo:formationDate",
      "@type": "xsd:date"
    },
    "isbn": {
      "@id": "bibo:isbn",
      "@type": "xsd:string"
    },
    "inScheme": {
      "@id": "skos:inScheme",
      "@type": "@id",
      "@container": "@set"
    },
    "description": {
      "@id": "dct:description",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "hasTranscription": {
      "@id": "ubbont:hasTranscription",
      "@type": "@id"
    },
    "pageIn": {
      "@id": "ubbont:pageIn",
      "@type": "@id"
    },
    "hasDZIView": {
      "@id": "ubbont:hasDZIView"
    },
    "format": {
      "@id": "dct:format",
      "@type": "xsd:string"
    },
    "relationToString": {
      "@id": "dc:relation"
    },
    "relation": {
      "@id": "dct:relation",
      "@type": "@id",
      "@container": "@set"
    },
    "temporal": {
      "@id": "dct:temporal"
    },
    "P26i_was_destination_of": {
      "@id": "ecrm:P26i_was_destination_of",
      "@type": "@id"
    },
    "Charter": {
      "@id": "ubbont:Charter"
    },
    "physicalCondition": {
      "@id": "ubbont:physicalCondition",
      "@container": [
        "@language",
        "@set"
      ]
    },
    "Collection": {
      "@id": "bibo:Collection"
    },
    "clauseStatus": {
      "@id": "ubbont:clauseStatus"
    },
    "workflowAction": {
      "@id": "ubbont:workflow/workflowAction",
      "@type": "@id"
    },
    "estimatedCollectionSize": {
      "@id": "ubbont:estimatedCollectionSize",
      "@type": "xsd:integer"
    },
    "BachelorThesis": {
      "@id": "ubbont:BachelorThesis"
    },
    "editor": {
      "@id": "bibo:editor",
      "@type": "@id"
    },
    "Letter": {
      "@id": "bibo:Letter"
    },
    "BookbindingDescription": {
      "@id": "ubbont:BookbindingDescription"
    }
  }
}

export default ubbontContext