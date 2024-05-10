/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Either an array of contexts, or a string containing the Linked Art context URI
 */
export type JSONLDContext = LinkedArt | LinkedArtWithExtensions;
export type LinkedArt = "https://linked.art/ns/v1/linked-art.json";
export type LinkedArtWithExtensions = string[];
/**
 * The URI of the entity
 */
export type TheSubjectUri = string;
/**
 * The class of the entity
 */
export type General = string;
export type Specific = "LinguisticObject";
/**
 * A human readable name or label for the entity, intended for developers
 */
export type RdfsLabel = string;
/**
 * The class of the entity
 */
export type General1 = string;
export type Specific1 = "Name";
/**
 * The class of the entity
 */
export type General2 = string;
export type Specific2 = "Type";
/**
 * A `Type` which classifies this entity beyond the class given in the `type` property
 */
export type CrmP2HasType = CrmE55_Type[];
/**
 * The string representation of a `Name`, `Identifier`, `Statement` or other text
 */
export type CrmP190HasSymbolicContent = string;
/**
 * The class of the entity
 */
export type General3 = string;
/**
 * A reference to one or more `Language` entities in which the `content` of this text is written
 */
export type CrmP72HasLanguage = CrmE56_Language[];
/**
 * The class of the entity
 */
export type General4 = string;
export type Specific3 = "LinguisticObject";
/**
 * The media type of the content of the embedded text, e.g. text/plain
 */
export type DcFormat = string;
/**
 * The class of the entity
 */
export type General5 = string;
export type Specific4 = "DigitalObject";
/**
 * The class of the entity
 */
export type General6 = string;
/**
 * An embedded statement about this entity, or a reference to a text that refers to the entity
 */
export type CrmP67IIsReferredToBy = (
  | CrmE33_Linguistic_Object
  | DigD1_Digital_ObjectSeeSchemaDigitalHtml
  | CrmE33_Linguistic_Object1
)[];
/**
 * The class of the entity
 */
export type General7 = string;
export type Specific5 = "Identifier";
/**
 * The class of the entity
 */
export type General8 = string;
export type Specific6 = "AttributeAssignment";
/**
 * The class of the entity
 */
export type General9 = string;
export type Specific7 = "Place";
/**
 * A `Place` at which this event occured
 */
export type CrmP7TookPlaceAt = CrmE53_Place[];
/**
 * The class of the entity
 */
export type General10 = string;
export type Specific8 = "TimeSpan";
/**
 * The earliest possible date-time at which the timespan could have started
 */
export type CrmP82ABeginOfTheBegin = string;
/**
 * The latest possible date-time at which the timespan could have started
 */
export type CrmP81AEndOfTheBegin = string;
/**
 * The earliest possible date-time at which the timespan could have ended
 */
export type CrmP81BBeginOfTheEnd = string;
/**
 * The latest possible date-time at which the timespan could have ended
 */
export type CrmP82BEndOfTheEnd = string;
/**
 * The class of the entity
 */
export type General11 = string;
export type Specific9 = "Dimension";
/**
 * The numeric value of a `Dimension` or `MonetaryAmount`
 */
export type CrmP90HasValue = number;
/**
 * The lowest possible value for the `Dimension` or `MonetaryAmount`
 */
export type CrmP90AHasLowerValueLimit = number;
/**
 * The highest possible value for the `Dimension` or `MonetaryAmount`
 */
export type CrmP90AHasUpperValueLimit = number;
/**
 * The class of the entity
 */
export type General12 = string;
/**
 * The Measurement(s) that led to the assigning of this dimension
 */
export type CrmP141IWasAssignedBy = CrmE13_Attribute_Assignment[];
/**
 * The class of the entity
 */
export type General13 = string;
/**
 * The class of the entity
 */
export type General14 = string;
/**
 * Another event which caused this event to occur
 */
export type SciO13IIsTriggeredBy = (CrmE6_Event | CrmE7_Activity)[];
/**
 * The class of the entity
 */
export type General15 = string;
export type Specific10 = "Person";
/**
 * The class of the entity
 */
export type RdfType = string;
export type Specific11 = "Group";
/**
 * A reference to a Person or Group which carried out this activity
 */
export type CrmP14CarriedOutBy = (E21_Person | CrmE74_Group)[];
/**
 * The class of the entity
 */
export type RdfType1 = string;
export type Specific12 = "HumanMadeObject";
/**
 * The class of the entity
 */
export type RdfType2 = string;
/**
 * An object or set of things which was used to carry out this activity
 */
export type CrmP16UsedSpecificObject = (CrmE22_HumanMade_Object | LaSet)[];
/**
 * The class of the entity
 */
export type RdfType3 = string;
export type Specific13 =
  | "HumanMadeObject"
  | "Person"
  | "Group"
  | "VisualItem"
  | "LinguisticObject"
  | "Set"
  | "Place"
  | "DigitalObject"
  | "Type"
  | "Event"
  | "Activity"
  | "Period";
/**
 * An entity that influenced the activity in some way
 */
export type CrmP15WasInfluencedBy = NoName[];
/**
 * A general technique that was employed to carry out this activity
 */
export type CrmP32UsedGeneralTechnique = CrmE55_Type[];
/**
 * The relationship from the attributed entity to the assigned entity, given as a string which resolves to a relationship in the context definition
 */
export type CrmP177AssignedPropertyType = string;
/**
 * A `Name` or `Identifier` that identifies the entity
 */
export type CrmP1IsIdentifiedBy = (CrmE33_E41_Linguistic_Appellation | CrmE42_Identifier)[];
/**
 * A reference to one or more other identities for this entity, such as in external vocabularies or systems
 */
export type General16 = NoName[];
/**
 * List of equivalent `LinguisticObject` entities
 */
export type Specific14 = CrmE33_Linguistic_Object1[];
/**
 * The class of the entity
 */
export type RdfType4 = string;
export type Specific15 = "VisualItem";
/**
 * The class of the entity
 */
export type RdfType5 = string;
export type Specific16 = "DigitalObject";
/**
 * A URL from which the digital object is able to be retrieved
 */
export type LaAccessPoint = DigD1_Digital_ObjectSeeSchemaDigitalHtml[];
/**
 * The class of the entity
 */
export type RdfType6 = string;
/**
 * A standard or specification that this entity conforms to or embodies
 */
export type DctermsConformsTo = CrmE73_Information_Object[];
/**
 * A digital object that shows the current visual item
 */
export type LaDigitallyShownBy = DigD1_Digital_Object[];
/**
 * An embedded link through a VisualItem to a Digital Object
 */
export type CrmP138IHasRepresentation = CrmE36_Visual_Item[];
/**
 * A reference to one or more `Set` entities of which this entity is a member
 */
export type LaMemberOf = LaSet[];
/**
 * The class of the entity
 */
export type RdfType7 = string;
export type Specific17 = "LinguisticObject";
/**
 * A digital object that carries the current linguistic object
 */
export type LaDigitallyCarriedBy = DigD1_Digital_Object[];
/**
 * One or more human-readable web pages or other digital objects where the focus of the content is this entity
 */
export type CrmP129IIsSubjectOf = CrmE33_Linguistic_Object2[];
/**
 * One or more AttributeAssignments that relate some other entity to this one
 */
export type CrmP140IWasAttributedBy = CrmE13_Attribute_Assignment[];
/**
 * One or more `Dimension` structures that describe this entity
 */
export type CrmP43HasDimension = CrmE54_Dimension[];
/**
 * The class of the entity
 */
export type RdfType8 = string;
export type Specific18 = "Right";
/**
 * The class of the entity
 */
export type RdfType9 = string;
export type Specific19 = "Creation";
/**
 * An identified event or activity which this creation is part of
 */
export type CrmP9IFormsPartOf = CrmE6_Event | CrmE7_Activity;
/**
 * One or more Rights that this object is subject to
 */
export type CrmP104IIsSubjectTo = CrmE30_Right[];
/**
 * The main topic(s) of the content
 */
export type CrmP129IsAbout = NoName[];
/**
 * The class of the entity
 */
export type RdfType10 = string;
export type Specific20 = "Activity";
export type CrmP16IWasUsedFor = CrmE7_Activity1[];
/**
 * The class of the entity
 */
export type RdfType11 = string;
/**
 * Reference to another Linguistic Object or Visual Item of which this is part
 */
export type CrmP106IFormsPartOf = (CrmE36_Visual_Item1 | CrmE33_Linguistic_Object1)[];

/**
 * _crm:E33\_Linguistic\_Object_
 * Textual content expressed in one or more human languages, which might or might not be written down on any physical carrier.
 * See: [API](https://linked.art/api/1.0/endpoint/textual_work/) | [Model](https://linked.art/model/document/)
 */
export interface TextSchema {
  "@context": JSONLDContext;
  id: TheSubjectUri;
  type: General & Specific;
  _label: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  equivalent?: General16 & Specific14;
  representation?: CrmP138IHasRepresentation;
  member_of?: LaMemberOf;
  subject_of?: CrmP129IIsSubjectOf;
  attributed_by?: CrmP140IWasAttributedBy;
  dimension?: CrmP43HasDimension;
  subject_to?: CrmP104IIsSubjectTo;
  format?: DcFormat;
  language?: CrmP72HasLanguage;
  about?: CrmP129IsAbout;
  created_by?: CrmP94IWasCreatedBy1;
  used_for?: CrmP16IWasUsedFor;
  part_of?: CrmP106IFormsPartOf;
  content?: CrmP190HasSymbolicContent;
}
/**
 * A name of an entity
 * See: [API](https://linked.art/api/1.0/shared/name/) | [Model](https://linked.art/model/base/#names)
 */
export interface CrmE33_E41_Linguistic_Appellation {
  _label?: RdfsLabel;
  type: General1 & Specific1;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  content: CrmP190HasSymbolicContent;
  language?: CrmP72HasLanguage;
  referred_to_by?: CrmP67IIsReferredToBy;
  /**
   * A list of one or more `Name` structures, which are parts of this `Name`
   */
  part?: CrmE33_E41_Linguistic_Appellation[];
}
/**
 * A concept or 'Type' in the taxonomic sense
 * See: [API](https://linked.art/api/1.0/shared/type/) | [Model](https://linked.art/model/base/#types-and-classifications)
 */
export interface CrmE55_Type {
  id: TheSubjectUri;
  _label?: RdfsLabel;
  type: General2 & Specific2;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
}
/**
 * Reference to a `Language`
 */
export interface CrmE56_Language {
  id: TheSubjectUri;
  type: General3 & "Language";
  _label?: RdfsLabel;
}
/**
 * An embedded, relatively short piece of textual content
 * See: [API](https://linked.art/api/1.0/shared/statement/) | [Model](https://linked.art/model/base/#statements-about-a-resource)
 */
export interface CrmE33_Linguistic_Object {
  _label?: RdfsLabel;
  type: General4 & Specific3;
  identified_by?: CrmP1IsIdentifiedBy;
  referred_to_by?: CrmP67IIsReferredToBy;
  classified_as?: CrmP2HasType;
  content: CrmP190HasSymbolicContent;
  language?: CrmP72HasLanguage;
  format?: DcFormat;
}
/**
 * Reference to a `DigitalObject`
 */
export interface DigD1_Digital_ObjectSeeSchemaDigitalHtml {
  id: TheSubjectUri;
  type: General5 & Specific4;
  _label?: RdfsLabel;
}
/**
 * Reference to a `LinguisticObject`
 * See: [Schema](text.html)
 */
export interface CrmE33_Linguistic_Object1 {
  id: TheSubjectUri;
  type: General6 & "LinguisticObject";
  _label?: RdfsLabel;
}
/**
 * An identifier for an entity
 * See: [API](https://linked.art/api/1.0/shared/identifier/) | [Model](https://linked.art/model/base/#identifiers)
 */
export interface CrmE42_Identifier {
  _label?: RdfsLabel;
  type: General7 & Specific5;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  content: CrmP190HasSymbolicContent;
  /**
   * A list of one or more `Identifier` structures, which are parts of this `Identifier`
   */
  part?: CrmE42_Identifier[];
  /**
   * The activity through which this `Identifier` was assigned to the entity
   */
  assigned_by?: CrmE13_Attribute_Assignment[];
}
/**
 * An activity which involves the assignment of some value to some entity, often with an explicit relationship between value and entity
 */
export interface CrmE13_Attribute_Assignment {
  type: General8 & Specific6;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  took_place_at?: CrmP7TookPlaceAt;
  timespan?: CrmP4HasTimeSpan;
  caused_by?: SciO13IIsTriggeredBy;
  carried_out_by?: CrmP14CarriedOutBy;
  used_specific_object?: CrmP16UsedSpecificObject;
  influenced_by?: CrmP15WasInfluencedBy;
  technique?: CrmP32UsedGeneralTechnique;
  part_of?: CrmE6_Event | CrmE7_Activity;
  assigned?: NoName1;
  assigned_property?: CrmP177AssignedPropertyType;
}
/**
 * Reference to a `Place` entity
 * See: [Schema](place.html)
 */
export interface CrmE53_Place {
  id: TheSubjectUri;
  type: General9 & Specific7;
  _label?: RdfsLabel;
}
/**
 * A `TimeSpan` which describes the date-time range during which this event occured
 */
export interface CrmP4HasTimeSpan {
  _label?: RdfsLabel;
  type: General10 & Specific8;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  begin_of_the_begin?: CrmP82ABeginOfTheBegin;
  end_of_the_begin?: CrmP81AEndOfTheBegin;
  begin_of_the_end?: CrmP81BBeginOfTheEnd;
  end_of_the_end?: CrmP82BEndOfTheEnd;
  duration?: CrmP191HadDuration;
}
/**
 * A `Dimension` that describes the duration of the timespan within any given date-times
 */
export interface CrmP191HadDuration {
  _label?: RdfsLabel;
  type: General11 & Specific9;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  value: CrmP90HasValue;
  lower_value_limit?: CrmP90AHasLowerValueLimit;
  upper_value_limit?: CrmP90AHasUpperValueLimit;
  unit: CrmP91HasUnit;
  assigned_by?: CrmP141IWasAssignedBy;
}
/**
 * Reference to the MeasurementUnit for this dimension
 */
export interface CrmP91HasUnit {
  id: TheSubjectUri;
  type: General12 & "MeasurementUnit";
  _label?: RdfsLabel;
}
/**
 * Reference to an `Event`
 * See: [Schema](event.html)
 */
export interface CrmE6_Event {
  id: TheSubjectUri;
  type: General13 & "Event";
  _label?: RdfsLabel;
}
/**
 * Reference to an `Activity`
 * See: [Schema](event.html)
 */
export interface CrmE7_Activity {
  id: TheSubjectUri;
  type: General14 & "Activity";
  _label?: RdfsLabel;
}
/**
 * Reference to a `Person`
 * See: [Schema](person.html)
 */
export interface E21_Person {
  id: TheSubjectUri;
  type: General15 & Specific10;
  _label?: RdfsLabel;
}
/**
 * Reference to a `Group`
 * See: [Schema](group.html)
 */
export interface CrmE74_Group {
  id: TheSubjectUri;
  type: RdfType & Specific11;
  _label?: RdfsLabel;
}
/**
 * Reference to a `HumanMadeObject`
 * See: [Schema](object.html)
 */
export interface CrmE22_HumanMade_Object {
  id: TheSubjectUri;
  type: RdfType1 & Specific12;
  _label?: RdfsLabel;
}
/**
 * Reference to a `Set`
 * See: [Schema](set.html)
 */
export interface LaSet {
  id: TheSubjectUri;
  type: RdfType2 & "Set";
  _label?: RdfsLabel;
}
/**
 * Reference to another primary entity
 * See: [API](https://linked.art/api/1.0/shared/reference/) | [Model]()
 */
export interface NoName {
  id: TheSubjectUri;
  type: RdfType3 & Specific13;
  _label?: RdfsLabel;
}
/**
 * Attribute Assignments can assign any entity, structure or value
 */
export interface NoName1 {
  [k: string]: unknown;
}
/**
 * An embedded Visual Item, such as the content of a digital image
 */
export interface CrmE36_Visual_Item {
  type: RdfType4 & Specific15;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  digitally_shown_by?: LaDigitallyShownBy;
}
/**
 * An embedded Digital Object, such as a home page reference
 */
export interface DigD1_Digital_Object {
  type?: RdfType5 & Specific16;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  access_point?: LaAccessPoint;
  format?: DcFormat;
  conforms_to?: DctermsConformsTo;
  [k: string]: unknown;
}
/**
 * Reference to an `InformationObject`
 */
export interface CrmE73_Information_Object {
  id: TheSubjectUri;
  type: RdfType6 & "InformationObject";
  _label?: RdfsLabel;
}
/**
 * An embedded Linguistic Object, such as the content of a web page
 */
export interface CrmE33_Linguistic_Object2 {
  type: RdfType7 & Specific17;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  language?: CrmP72HasLanguage;
  digitally_carried_by?: LaDigitallyCarriedBy;
}
/**
 * A measurable aspect of an entity, with a numeric value, a unit for that value, and a type relative to the entity
 * See: [API](https://linked.art/api/1.0/shared/dimension/) | [Model](https://linked.art/model/object/physical/#dimensions)
 */
export interface CrmE54_Dimension {
  _label?: RdfsLabel;
  type: General11 & Specific9;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  value: CrmP90HasValue;
  lower_value_limit?: CrmP90AHasLowerValueLimit;
  upper_value_limit?: CrmP90AHasUpperValueLimit;
  unit: CrmP91HasUnit;
  assigned_by?: CrmP141IWasAssignedBy;
}
/**
 * A legal right that can be held by some party over some entity
 */
export interface CrmE30_Right {
  _label?: RdfsLabel;
  type: RdfType8 & Specific18;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  created_by?: CrmP94IWasCreatedBy;
  possessed_by?: (E21_Person | CrmE74_Group)[];
}
/**
 * The creation of the intellectual/conceptual entity
 */
export interface CrmP94IWasCreatedBy {
  type?: RdfType9 & Specific19;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  took_place_at?: CrmP7TookPlaceAt;
  timespan?: CrmP4HasTimeSpan;
  caused_by?: SciO13IIsTriggeredBy;
  carried_out_by?: CrmP14CarriedOutBy;
  used_specific_object?: CrmP16UsedSpecificObject;
  influenced_by?: CrmP15WasInfluencedBy;
  technique?: CrmP32UsedGeneralTechnique;
  part_of?: CrmP9IFormsPartOf;
  [k: string]: unknown;
}
/**
 * The creation of the intellectual/conceptual entity
 */
export interface CrmP94IWasCreatedBy1 {
  type?: RdfType9 & Specific19;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  took_place_at?: CrmP7TookPlaceAt;
  timespan?: CrmP4HasTimeSpan;
  caused_by?: SciO13IIsTriggeredBy;
  carried_out_by?: CrmP14CarriedOutBy;
  used_specific_object?: CrmP16UsedSpecificObject;
  influenced_by?: CrmP15WasInfluencedBy;
  technique?: CrmP32UsedGeneralTechnique;
  part_of?: CrmP9IFormsPartOf;
  [k: string]: unknown;
}
/**
 * An activity carried out by some person or group
 */
export interface CrmE7_Activity1 {
  type: RdfType10 & Specific20;
  _label?: RdfsLabel;
  identified_by?: CrmP1IsIdentifiedBy;
  classified_as?: CrmP2HasType;
  referred_to_by?: CrmP67IIsReferredToBy;
  took_place_at?: CrmP7TookPlaceAt;
  timespan?: CrmP4HasTimeSpan;
  caused_by?: SciO13IIsTriggeredBy;
  carried_out_by?: CrmP14CarriedOutBy;
  used_specific_object?: CrmP16UsedSpecificObject;
  influenced_by?: CrmP15WasInfluencedBy;
  technique?: CrmP32UsedGeneralTechnique;
  part_of?: CrmE6_Event | CrmE7_Activity;
}
/**
 * Reference to a `VisualItem`
 * See: [Schema](image.html)
 */
export interface CrmE36_Visual_Item1 {
  id: TheSubjectUri;
  type: RdfType11 & "VisualItem";
  _label?: RdfsLabel;
}
