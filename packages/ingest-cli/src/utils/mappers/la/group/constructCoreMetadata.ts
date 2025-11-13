import { classToAttMapping } from '../mapClassToClassifiedAs';
import { TBaseMetadata } from '../../../ingest-object/fetch-item';
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
    email,
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

  const classified_as = [
    {
      id: classToAttMapping[hasType]?.mapping ?? "https://fix.me/missing-mapping",
      type: "Type",
      _label: hasType,
    }
  ];

  const contact_point = email ? [{
    "type": "Identifier",
    "classified_as": [
      {
        "id": "http://vocab.getty.edu/aat/300435686",
        "type": "Type",
        "_label": "Email Address"
      }
    ],
    "content": email
  }] : [];

  return omitEmptyEs({
    "@context": context,
    id: newId,
    type: "Group",
    _label: coalesceLabel(_label) ?? `${hasType} with identifier ${newId}`,
    classified_as: [
      ...classified_as
    ],
    contact_point,
    ...data
  });
}