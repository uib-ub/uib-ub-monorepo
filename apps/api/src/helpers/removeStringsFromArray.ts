/**
 * Removes non-object items from the specified properties of the input data array.
 * We have situations where the object in an spo is not in the dataset, and we need to remove it.
 * @param data - The input data array.
 * @returns The modified data object with filtered properties.
 */
export const removeStringsFromArray = (data: any) => {
  // If the items in the array is not an object we remove it. 
  let { subject, spatial, relation, isPartOf, hasPart } = data;
  if (Array.isArray(relation)) {
    relation = relation.filter((item: any) => typeof item === 'object');
  }
  if (Array.isArray(hasPart)) {
    hasPart = hasPart.filter((item: any) => typeof item === 'object');
  }
  if (Array.isArray(isPartOf)) {
    isPartOf = isPartOf.filter((item: any) => typeof item === 'object');
  }
  if (Array.isArray(spatial)) {
    spatial = spatial.filter((item: any) => typeof item === 'object');
  }
  if (Array.isArray(subject)) {
    subject = subject.filter((item: any) => typeof item === 'object');
  }
  return {
    ...data,
    relation: relation?.length > 0 ? relation : undefined,
    hasPart: hasPart?.length > 0 ? hasPart : undefined,
    isPartOf: isPartOf?.length > 0 ? isPartOf : undefined,
    spatial: spatial?.length > 0 ? spatial : undefined,
    subject: subject?.length > 0 ? subject : undefined,
  }
};
