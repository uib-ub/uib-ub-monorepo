import omitEmptyEs from 'omit-empty-es';
import { TBaseMetadata } from '../../models';

export const constructCoreMetadata = (base: TBaseMetadata, data: any) => {
  const {
    context,
    newId,
    _label,
  } = base;

  if (
    !newId &&
    !_label &&
    !context
  ) return data;

  delete data.id
  delete data._label
  delete data["@context"]

  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "HumanMadeObject",
    _label,
    ...data
  });
}