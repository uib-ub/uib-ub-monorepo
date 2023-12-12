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
