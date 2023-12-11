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
