import { SanityDocument, SanityImageAssetDocument } from 'next-sanity';
import { PortableTextBlock } from 'sanity';

export type ContributionAssignmentProps = {
  assignedActor: {
    id: string;
    label: string;
  };
  assignedRole?: {
    id: string;
    label: string;
  }[];
  period?: string;
  active?: string;
}

export interface SkillListProps {
  id: string
  type: string
  label: string
  level: number
  shortDescription: string
}

export type TimelineProps = {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    type: string
    label: string
  }[]
  period: string
  timestamp: string
  connectedTo: {
    id: string
    type: string
    label: string
  }[]
}

export interface PersonProps extends SanityDocument {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    label: string
  }[]
  quote: string
  image: SanityImageAssetDocument
  shortDescription: string
  period: string
  referredToBy: {
    body: (PortableTextBlock | any)[]
  }[]
  hasSkill: SkillListProps[]
  currentOrFormerManagerOf: {
    id: string
    type: string
    label: string
    timespan: string
  }[]
  mentions: {
    id: string
    type: string
    label: string
  }[]
  memberOf: {
    id: string
    label: string
    hasType: {
      id: string
      label: string
    }[]
    hasMember: {
      assignedRole: {
        id: string
        label: string
      }[]
      timespan: string
      retired: boolean
    }[]
    timespan: string
    active: boolean
  }[]
  timeline: TimelineProps[]
}