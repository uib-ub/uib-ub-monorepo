import omitEmptyEs from 'omit-empty-es';
import { getLanguage } from './getLanguage';

export const constructAssertions = (data: any) => {
  const {
    relation
  } = data;

  if (!relation) return data;

  delete data.relation

  let relationArray: any[] = []

  if (relation) {
    relationArray = relation.map((relation: any) => {
      return {
        type: "AttributeAssignment",
        assigned_property: "relation",
        assigned: [
          {
            id: relation.id,
            type: relation.type,
            _label: relation._label,
          }
        ]
      }
    });
  }

  return omitEmptyEs({
    ...data,
    attributed_by: relationArray
  });
}