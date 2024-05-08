import omitEmptyEs from 'omit-empty-es';
import { TBaseMetadata } from '../../../../models';
import { classToAttMapping } from '../../mapClassToClassifiedAs';

export const constructCoreMetadata = (base: TBaseMetadata, data: any) => {
  const {
    context,
    newId,
    _label,
  } = base;

  const {
    hasType,
  } = data;

  if (
    !newId &&
    !_label &&
    !context
  ) return data;

  delete data.id
  delete data._label
  delete data["@context"]

  const classified_as = [
    {
      id: classToAttMapping[hasType]?.mapping ?? "https://fix.me/missing-mapping",
      type: "Type",
      _label: hasType,
    }
  ];



  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "Group",
    _label,
    classified_as: [
      ...classified_as
    ],
    ...data
  });
}