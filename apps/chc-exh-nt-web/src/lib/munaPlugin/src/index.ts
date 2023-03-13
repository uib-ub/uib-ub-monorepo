import { default as blockContent } from "./schemas/portableText/blockContent";
import { default as LocaleBlock } from "./schemas/portableText/LocaleBlock";
import { default as LocaleBlockReport } from "./schemas/portableText/LocaleBlockReport";
import { default as LocaleBlockSimple } from "./schemas/portableText/LocaleBlockSimple";
import { default as reportText } from "./schemas/portableText/reportText";
import { default as simpleBlockContent } from "./schemas/portableText/simpleBlockContent";
import { default as Dimension } from "./schemas/classes/dimension/Dimension";
import { default as Identifier } from "./schemas/classes/persistent/appelation/Identifier";
import { default as Name } from "./schemas/classes/persistent/appelation/Name";
import { default as AcquisitionType } from "./schemas/classes/persistent/conceptual/type/AcquisitionType";
import { default as ActivityType } from "./schemas/classes/persistent/conceptual/type/ActivityType";
import { default as ActorType } from "./schemas/classes/persistent/conceptual/type/ActorType";
import { default as AppelationType } from "./schemas/classes/persistent/conceptual/type/AppelationType";
import { default as Concept } from "./schemas/classes/persistent/conceptual/type/Concept";
import { default as ConditionType } from "./schemas/classes/persistent/conceptual/type/ConditionType";
import { default as DimensionType } from "./schemas/classes/persistent/conceptual/type/DimensionType";
import { default as EventType } from "./schemas/classes/persistent/conceptual/type/EventType";
import { default as ExhibitionType } from "./schemas/classes/persistent/conceptual/type/ExhibitionType";
import { default as IdentifierType } from "./schemas/classes/persistent/conceptual/type/IdentifierType";
import { default as Language } from "./schemas/classes/persistent/conceptual/type/Language";
import { default as Material } from "./schemas/classes/persistent/conceptual/type/Material";
import { default as MeasurementUnit } from "./schemas/classes/persistent/conceptual/type/MeasurementUnit";
import { default as ObjectType } from "./schemas/classes/persistent/conceptual/type/ObjectType";
import { default as PlaceType } from "./schemas/classes/persistent/conceptual/type/PlaceType";
import { default as ReportType } from "./schemas/classes/persistent/conceptual/type/ReportType";
import { default as Role } from "./schemas/classes/persistent/conceptual/type/Role";
import { default as StorageType } from "./schemas/classes/persistent/conceptual/type/StorageType";
import { default as Technique } from "./schemas/classes/persistent/conceptual/type/Technique";
import { default as TextType } from "./schemas/classes/persistent/conceptual/type/TextType";
import { default as WorkType } from "./schemas/classes/persistent/conceptual/type/WorkType";
import { default as VisualItem } from "./schemas/classes/persistent/conceptual/VisualItem";
import { default as VisualItemObject } from "./schemas/classes/persistent/conceptual/VisualItemObject";
import { default as Work } from "./schemas/classes/persistent/conceptual/Work";
import { default as Dataset } from "./schemas/classes/persistent/information/Dataset";
import { default as DesignOrProcedure } from "./schemas/classes/persistent/information/DesignOrProcedure";
import { default as DigitalObject } from "./schemas/classes/persistent/information/DigitalObject";
import { default as DigitalObjectFile } from "./schemas/classes/persistent/information/DigitalObjectFile";
import { default as DigitalObjectImage } from "./schemas/classes/persistent/information/DigitalObjectImage";
import { default as Geojson } from "./schemas/classes/persistent/information/Geojson";
import { default as GeojsonFeature } from "./schemas/classes/persistent/information/GeojsonFeature";
import { default as GeojsonFeatureCollection } from "./schemas/classes/persistent/information/GeojsonFeatureCollection";
import { default as GeojsonPoint } from "./schemas/classes/persistent/information/GeojsonPoint";
import { default as GeojsonProperties } from "./schemas/classes/persistent/information/GeojsonProperties";
import { default as LinguisticDocument } from "./schemas/classes/persistent/information/LinguisticDocument";
import { default as LinguisticObject } from "./schemas/classes/persistent/information/LinguisticObject";
import { default as Manifest } from "./schemas/classes/persistent/information/Manifest";
import { default as Set } from "./schemas/classes/persistent/information/Set";
import { default as OpenGraph } from "./schemas/classes/persistent/information/site/OpenGraph";
import { default as Page } from "./schemas/classes/persistent/information/site/Page";
import { default as BigTextBlock } from "./schemas/portableText/blocks/BigTextBlock";
import { default as EventBlock } from "./schemas/portableText/blocks/EventBlock";
import { default as GridBlock } from "./schemas/portableText/blocks/GridBlock";
import { default as HeroBlock } from "./schemas/portableText/blocks/HeroBlock";
import { default as IframeBlock } from "./schemas/portableText/blocks/IframeBlock";
import { default as ObjectCompareBlock } from "./schemas/portableText/blocks/ObjectCompareBlock";
import { default as PageHeaderBlock } from "./schemas/portableText/blocks/PageHeaderBlock";
import { default as QuoteBlock } from "./schemas/portableText/blocks/QuoteBlock";
import { default as CardBlock } from "./schemas/portableText/blocks/CardBlock";
import { default as PublicationBlock } from "./schemas/portableText/blocks/PublicationBlock";
import { default as TextBlock } from "./schemas/portableText/blocks/TextBlock";
import { default as SlideshowStripBlock } from "./schemas/portableText/blocks/SlideshowStripBlock";
import { default as TableBlock } from "./schemas/portableText/blocks/TableBlock";
import { default as TwoColumnBlock } from "./schemas/portableText/blocks/TwoColumnBlock";
import { default as VideoBlock } from "./schemas/portableText/blocks/VideoBlock";
import { default as Gallery } from "./schemas/portableText/blocks/withIllustration/Gallery";
import { default as Illustration } from "./schemas/portableText/blocks/withIllustration/Illustration";
import { default as IllustrationWithCaption } from "./schemas/portableText/blocks/withIllustration/IllustrationWithCaption";
import { default as ItemView } from "./schemas/portableText/blocks/withIllustration/ItemView";
import { default as MiradorGallery } from "./schemas/portableText/blocks/withIllustration/MiradorGallery";
import { default as MiradorGalleryWindow } from "./schemas/portableText/blocks/withIllustration/MiradorGalleryWindow";
import { default as ObjectBlock } from "./schemas/portableText/blocks/ObjectBlock";
import { default as ObjectBlockItem } from "./schemas/portableText/blocks/ObjectBlockItem";
import { default as Post } from "./schemas/classes/persistent/information/site/Post";
import { default as Route } from "./schemas/classes/persistent/information/site/Route";
import { default as SiteSettings } from "./schemas/classes/persistent/information/site/SiteSettings";
import { default as ToC } from "./schemas/classes/persistent/information/site/ToC";
import { default as ToCSection } from "./schemas/classes/persistent/information/site/ToCSection";
import { default as ToCLink } from "./schemas/classes/persistent/information/site/ToCLink";
import { default as Actor } from "./schemas/classes/persistent/physical/Actor";
import { default as Collection } from "./schemas/classes/persistent/physical/Collection";
import { default as DigitalDevice } from "./schemas/classes/persistent/physical/DigitalDevice";
import { default as HumanMadeObject } from "./schemas/classes/persistent/physical/HumanMadeObject";
import { default as Report } from "./schemas/classes/persistent/report/Report";
import { default as Sampling } from "./schemas/classes/persistent/report/Sampling";
import { default as Treatment } from "./schemas/classes/persistent/report/Treatment";
import { default as TreatmentAssessment } from "./schemas/classes/persistent/report/TreatmentAssessment";
import { default as Place } from "./schemas/classes/place/Place";
import { default as Storage } from "./schemas/classes/place/Storage";
import { default as Presence } from "./schemas/classes/spacetimevolume/Presence";
import { default as SpacetimeVolume } from "./schemas/classes/spacetimevolume/SpacetimeVolume";
import { default as Acquisition } from "./schemas/classes/temporal/activity/Acquisition";
import { default as Activity } from "./schemas/classes/temporal/activity/Activity";
import { default as BeginningOfExistence } from "./schemas/classes/temporal/activity/BeginningOfExistence";
import { default as Birth } from "./schemas/classes/temporal/activity/Birth";
import { default as ContributionAssignment } from "./schemas/classes/temporal/activity/ContributionAssignment";
import { default as Creation } from "./schemas/classes/temporal/activity/Creation";
import { default as DataTransferEvent } from "./schemas/classes/temporal/activity/DataTransferEvent";
import { default as Death } from "./schemas/classes/temporal/activity/Death";
import { default as Destruction } from "./schemas/classes/temporal/activity/Destruction";
import { default as Dissolution } from "./schemas/classes/temporal/activity/Dissolution";
import { default as Formation } from "./schemas/classes/temporal/activity/Formation";
import { default as Joining } from "./schemas/classes/temporal/activity/Joining";
import { default as Leaving } from "./schemas/classes/temporal/activity/Leaving";
import { default as Measurement } from "./schemas/classes/temporal/activity/Measurement";
import { default as Modification } from "./schemas/classes/temporal/activity/Modification";
import { default as Move } from "./schemas/classes/temporal/activity/Move";
import { default as Production } from "./schemas/classes/temporal/activity/Production";
import { default as Project } from "./schemas/classes/temporal/activity/Project";
import { default as Transformation } from "./schemas/classes/temporal/activity/Transformation";
import { default as ConditionState } from "./schemas/classes/temporal/ConditionState";
import { default as Event } from "./schemas/classes/temporal/Event";
import { default as Exhibition } from "./schemas/classes/temporal/Exhibition";
import { default as Period } from "./schemas/classes/temporal/Period";
import { default as LocalizedKeyword } from "./schemas/strings/LocalizedKeyword";
import { default as LocalizedSlug } from "./schemas/strings/LocalizedSlug";
import { default as LocalizedString } from "./schemas/strings/LocalizedString";
import { default as LocalizedText } from "./schemas/strings/LocalizedText";
import { default as Timespan } from "./schemas/classes/timespan/Timespan"

export const schemaTypes = [
	// TYPES
	ActorType,
	AcquisitionType,
	ActivityType,
	Concept,
	ConditionType,
	EventType,
	ExhibitionType,
	Material,
	ObjectType,
	ReportType,
	StorageType,
	Technique,
	WorkType,
	PlaceType,
	AppelationType,
	IdentifierType,
	DimensionType,
	MeasurementUnit,
	Timespan,
	Language,
	LinguisticDocument,
	TextType,
	DigitalObject,
	DigitalObjectFile,
	DigitalObjectImage,
	Place,
	Role,
	reportText,
	VisualItem,
	Work,
	Geojson,
	GeojsonFeature,
	GeojsonFeatureCollection,
	GeojsonPoint,
	GeojsonProperties,
	DesignOrProcedure,
	ObjectCompareBlock,
	SlideshowStripBlock,
	Gallery,
	ItemView,
	MiradorGallery,
	MiradorGalleryWindow,
	Set,
	Acquisition,
	HumanMadeObject,
	VisualItemObject,
	Manifest,
	BigTextBlock,
	PageHeaderBlock,
	GridBlock,
	TableBlock,
	EventBlock,
	IllustrationWithCaption,
	Illustration,
	OpenGraph,
	Route,
	CardBlock,
	PublicationBlock,
	QuoteBlock,
	ObjectBlock,
	ObjectBlockItem,
	TextBlock,
	HeroBlock,
	TwoColumnBlock,
	VideoBlock,
	IframeBlock,
	Post,
	Page,
	SiteSettings,
	Report,
	Sampling,
	Treatment,
	TreatmentAssessment,
	Presence,
	SpacetimeVolume,
	BeginningOfExistence,
	Birth,
	Death,
	Destruction,
	Dissolution,
	Measurement,
	Production,
	Transformation,
	Move,
	Exhibition,
	Project,
	Activity,
	Event,
	Formation,
	Modification,
	Joining,
	Leaving,
	Collection,
	Storage,
	ConditionState,
	DigitalDevice,
	DataTransferEvent,
	Actor,
	ContributionAssignment,
	Period,
	Dataset,
	LinguisticObject,
	Creation,
	Name,
	blockContent,
	Identifier,
	simpleBlockContent,
	LocaleBlock,
	LocaleBlockReport,
	Dimension,
	LocalizedKeyword,
	LocalizedSlug,
	LocalizedText,
	LocalizedString,
	LocaleBlockSimple,
	ToC,
	ToCLink,
	ToCSection
]