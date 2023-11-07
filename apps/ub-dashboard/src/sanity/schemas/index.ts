import { AccessPoint } from './AccessPoint'
import { Activity } from './Activity'
import { Actor } from './Actor'
import { Currency } from './Currency'
import { Dataset } from './Dataset'
import { Endpoint } from './Endpoint'
import { Event } from './Event'
import { Group } from './Group'
import { Language } from './Language'
import { MonetaryAmount } from './MonetaryAmount'
import { Place } from './Place'
import { Platform } from './Platform'
import { Product } from './Product'
import { Project } from './Project'
import { Service } from './Service'
import { Software } from './Software'
import { Schema } from './SoftwareSchema'
import { VolatileSoftware } from './VolatileSoftware'
import { Concept } from './types/Concept'
import { ActivityType } from './types/ConceptActivityType'
import { EventType } from './types/ConceptEventType'
import { EncodingType } from './types/ConceptEncodingType'
import { GroupType } from './types/ConceptGroupType'
import { IdentifierType } from './types/ConceptIdentifierType'
import { NameType } from './types/ConceptNameType'
import { ProgrammingLanguage } from './types/ConceptProgrammingLanguage'
import { ProtocolType } from './types/ConceptProtocolType'
import { ProjectType } from './types/ConceptProjectType'
import { SoftwareType } from './types/ConceptSoftwareType'
import { AvailabilityType } from './types/ConceptAvailabilityType'
import { ConditionOfUseType } from './types/ConceptConditionOfUseType'
import { CompetenceType } from './types/ConceptCompetenceType'
import { Role } from './types/Role'
import { DigitalObjectImage } from './images/DigitalObjectImage'
import { ContributionAssignment } from './objects/ContributionAssignment'
import { VercelDeploymentConfig } from './objects/VercelDeploymentConfig'
import { GitLabCIConfig } from './objects/GitLabCIConfig'
import { NetlifyDeploymentConfig } from './objects/NetlifyDeploymentConfig'
import { DigitalObjectFile } from './objects/DigitalObjectFile'
import { LinguisticObject } from './objects/LinguisticObject'
import { PlatformUsageAssignment } from './objects/PlatformUsageAssignment'
import { Identifier } from './objects/Identifier'
import { Name } from './objects/Name'
import { ServiceUsageAssignment } from './objects/ServiceUsageAssignment'
import { Skill } from './objects/Skill'
import { WebResource } from './objects/WebResource'
import { BeginningOfExistence } from './activities/BeginningOfExistence'
import { FundingActivity } from './activities/FundingActivity'
import { Birth } from './activities/Birth'
import { Death } from './activities/Death'
import { Dissolution } from './activities/Dissolution'
import { EndOfExistence } from './activities/EndOfExistence'
import { Formation } from './activities/Formation'
import { Joining } from './activities/Joining'
import { Leaving } from './activities/Leaving'
import { Move } from './activities/Move'
import { SoftwareComputingEService } from './activities/SoftwareComputingEService'
import { SoftwareCuratingService } from './activities/SoftwareCuratingService'
import { SoftwareDeliveryEService } from './activities/SoftwareDeliveryEService'
import { HostingService } from './activities/HostingService'
import { TransferOfMember } from './activities/TransferOfMember'
import { blockContent } from './text/blockContent'
import { LocaleString } from './text/LocaleString'
import { Iframe } from './text/plugs/Iframe'
import { Illustration } from './text/plugs/Illustration'
import { IllustrationWithCaption } from './text/plugs/IllustrationWithCaption'
import { PageHeader } from './text/plugs/PageHeader'
import { SingleLevelChart } from './text/plugs/SingleLevelChart'
import { Table } from './text/plugs/Table'
import { Video } from './text/plugs/Video'

export const schemaTypes = [
  AccessPoint,
  Activity,
  Actor,
  Currency,
  Dataset,
  Endpoint,
  Event,
  Group,
  Language,
  MonetaryAmount,
  Place,
  Platform,
  Product,
  Project,
  Service,
  Software,
  Schema,
  VolatileSoftware,
  Concept,
  ActivityType,
  EventType,
  EncodingType,
  GroupType,
  IdentifierType,
  NameType,
  ProgrammingLanguage,
  ProtocolType,
  ProjectType,
  SoftwareType,
  AvailabilityType,
  ConditionOfUseType,
  CompetenceType,
  Role,
  DigitalObjectImage,
  ContributionAssignment,
  VercelDeploymentConfig,
  GitLabCIConfig,
  NetlifyDeploymentConfig,
  DigitalObjectFile,
  LinguisticObject,
  PlatformUsageAssignment,
  Identifier,
  Name,
  ServiceUsageAssignment,
  Skill,
  WebResource,
  BeginningOfExistence,
  FundingActivity,
  Birth,
  Death,
  Dissolution,
  EndOfExistence,
  Formation,
  Joining,
  Leaving,
  Move,
  SoftwareComputingEService,
  SoftwareCuratingService,
  SoftwareDeliveryEService,
  HostingService,
  TransferOfMember,
  blockContent,
  LocaleString,
  Iframe,
  Illustration,
  IllustrationWithCaption,
  PageHeader,
  SingleLevelChart,
  Table,
  Video,
]

export const PREVIEWABLE_DOCUMENT_TYPES = [
  Actor.name,
  Group.name
] satisfies string[]

export const PREVIEWABLE_DOCUMENT_TYPES_REQUIRING_SLUGS = [
  Actor.name,
  Group.name
] satisfies string[]
