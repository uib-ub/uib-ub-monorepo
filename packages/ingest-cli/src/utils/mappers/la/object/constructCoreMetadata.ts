import { classToAttMapping } from '../mapClassToClassifiedAs';
import { aatReproductionsType } from '../staticMapping';
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
    hasType,
    _available,
  } = data

  if (
    !newId &&
    !_label &&
    !context
  ) return data;

  delete data.id
  delete data._label
  delete data._available
  delete data["@context"]
  delete data.hasPart // @TODO: should be "backlinks" in the _links object. 
  delete data.catalogueStatus
  delete data.mainImage // TODO: do we use this boolean?
  delete data.prefLabel // Not allowed on object
  delete data.temporal // Mostly stuff that is in other fields
  delete data.hasClause // Ignore this for now
  delete data.logo // Logo is not allowed on object
  delete data['foaf:logo'] // Logo is not allowed on object

  // @TODO: This is a hack to get the classified_as field to work.
  const classified_as = [
    {
      id: classToAttMapping[hasType]?.mapping ?? "https://fix.me/missing-mapping",
      type: "Type",
      _label: hasType,
    },
    data.reproducedBy ? aatReproductionsType : null
  ];

  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "HumanMadeObject",
    _label: coalesceLabel(_label) ?? `${hasType} with identifier ${newId}`,
    _available: Array.isArray(_available) ? _available.reduce((a, b) => a < b ? a : b, _available[0]) : _available, // When multiple dates, we want the earliest
    classified_as: [
      ...classified_as
    ],
    ...data
  });
}