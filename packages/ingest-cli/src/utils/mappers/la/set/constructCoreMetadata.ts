import { TBaseMetadata } from '../../../ingest-object/fetch-item';
import omitEmptyEs from 'omit-empty-es';
import { coalesceLabel } from 'utils';
import { aatArchivalGroupingType, aatArchivalSubGroupingType } from '../staticMapping';

export const constructCoreMetadata = (base: TBaseMetadata, data: any) => {
  const {
    context,
    newId,
    _label,
  } = base;

  const {
    hasType,
    email,
    isPartOf
  } = data;

  if (
    !newId &&
    !_label &&
    !context &&
    !email
  ) return data;

  delete data.id
  delete data._label
  delete data["@context"]
  delete data.img
  delete data.lat
  delete data.long
  delete data.email
  delete data.owner
  delete data.based_near
  delete data.pages
  delete data.featured

  // We type the set as an archival grouping or sub grouping based on the isPartOf property
  const classified_as = [
    isPartOf ? aatArchivalSubGroupingType : aatArchivalGroupingType
  ];


  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "Set",
    _label: coalesceLabel(_label) ?? `${hasType} with identifier ${newId}`,
    classified_as: [
      ...classified_as
    ],
    ...data
  });
}