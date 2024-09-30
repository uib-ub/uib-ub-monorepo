import omitEmptyEs from 'omit-empty-es';

export const constructAssertions = (data: any) => {
  const {
    relation,
    relationToString,
  } = data;

  const references = data['dct:references']

  if (
    !relation &&
    !relationToString
  ) return data;

  delete data.relation
  delete data.relationToString
  delete data['dct:references']

  let relationArray: any[] = []
  // TODO: finish this. 
  // let relationToStringArray: any[] = []

  if (relation || references) {
    relationArray = [...(relation ?? []), ...(references ?? [])].map((relation: any) => {
      return {
        type: "AttributeAssignment",
        assigned_property: "relation",
        assigned: {
          id: relation.id,
          type: relation.type,
          _label: relation._label,
        }
      }
    });
  }

  return omitEmptyEs({
    ...data,
    attributed_by: [
      ...relationArray,
    ]
  });
}