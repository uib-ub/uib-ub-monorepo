
export const digitallyShownBy = {
  name: 'digitallyShownBy',
  title: 'Digitale bilder',
  description: 'For objekt med flere bilder, blad, versjoner eller sider av objektet. Bruk "hovedrepresentasjon" til forhåndsvisning.',
  fieldset: 'representation',
  type: 'array',
  of: [
    { type: 'image' },
  ],
  options: {
    hotspot: true,
    layout: 'grid',
  }
};
