import { classToAttMapping } from '../mapClassToClassifiedAs';
import { TBaseMetadata } from '../../../ingest-items/fetch-item';
import omitEmptyEs from 'omit-empty-es';

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