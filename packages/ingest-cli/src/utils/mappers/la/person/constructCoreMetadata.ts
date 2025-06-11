import { aatFemaleType, aatMaleType } from '../staticMapping';
import { TBaseMetadata } from '../../../ingest-items/fetch-item';
import omitEmptyEs from 'omit-empty-es';
import { coalesceLabel } from 'utils';

export const constructCoreMetadata = (base: TBaseMetadata, data: any) => {
  const {
    context,
    newId,
    _label,
  } = base;

  const {
    gender,
    hasType,
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
  delete data.formationYear
  delete data.extinctionYear
  delete data['foaf:logo']

  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "Person",
    _label: coalesceLabel(_label) ?? `${hasType} with identifier ${newId}`,
    classified_as: [
      gender === 'male' ? aatMaleType : null,
      gender === 'female' ? aatFemaleType : null,
    ],
    ...data
  });
}