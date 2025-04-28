import omitEmptyEs from 'omit-empty-es';

export const constructAssertions = (data: any) => {
  const {
    relation,
    relationToString,
    references,
  } = data;

  if (
    !relation &&
    !relationToString &&
    !references
  ) return data;

  delete data.relation
  delete data.relationToString
  delete data.references

  let relationArray: any[] = []
  let referenceStrings: any[] = []
  let referenceObjects: any[] = []

  // Split references into two arrays based on their shape
  if (references) {
    references.forEach((ref: any) => {
      if ('@value' in ref) {
        referenceStrings.push({
          type: "AttributeAssignment",
          assigned_property: "referenceText",
          assigned: {
            value: ref['@value'],
            language: ref['@language']
          }
        })
      } else if ('id' in ref) {
        referenceObjects.push({
          type: "AttributeAssignment",
          assigned_property: "relation",
          assigned: {
            id: ref.id,
            type: ref.type,
            _label: ref._label,
          }
        })
      }
    })
  }

  // Handle regular relations
  if (relation) {
    relationArray = relation.map((rel: any) => ({
      type: "AttributeAssignment",
      assigned_property: "relation",
      assigned: {
        id: rel.id,
        type: rel.type,
        _label: rel._label,
      }
    }));
  }

  return omitEmptyEs({
    ...data,
    attributed_by: [
      ...relationArray,
      ...referenceStrings,
      ...referenceObjects
    ]
  });
}