export const constructCollection = (data: any) => {
  const {
    isPartOf,
  } = data;
  if (!isPartOf) return data;

  delete data.isPartOf

  const sets = isPartOf.map((collection: any) => {
    return {
      id: `${collection.id}/set`,
      type: 'Set',
      _label: collection._label,
    };
  })

  return {
    ...data,
    member_of: sets,
  };


}