import omitEmptyEs from 'omit-empty-es';
import { TBaseMetadata } from '../../../../models';
import { aatFemaleType, aatMaleType } from '../../staticMapping';

export const constructCoreMetadata = (base: TBaseMetadata, data: any) => {
  const {
    context,
    newId,
    _label,
  } = base;

  const {
    gender,
  } = data;

  if (
    !newId &&
    !_label &&
    !context &&
    !gender
  ) return data;

  delete data.id
  delete data._label
  delete data["@context"]
  delete data.gender

  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "Person",
    _label,
    classified_as: [
      gender === 'male' ? aatMaleType : null,
      gender === 'female' ? aatFemaleType : null,
    ],
    ...data
  });
}