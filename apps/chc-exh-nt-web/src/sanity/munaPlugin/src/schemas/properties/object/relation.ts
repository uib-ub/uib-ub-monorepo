
export const relation = {
  name: 'relation',
  title: 'Relasjon',
  description: 'Uspesifisert relasjon til en annen ting',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Actor' },
        { type: 'Event' },
        { type: 'Activity' },
      ],
    },
  ],
};
