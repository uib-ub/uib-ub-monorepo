import { groq } from 'next-sanity'
import { depicts } from './props'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const item = groq`*[_id == $id] {
  ...,
  ${depicts},
  hasType[]-> {
    _id,
    label
  },
  image {
    asset->{
      ...,
      metadata
    },
    "palette": asset->.metadata.palette,
  },
  subjectOfManifest,
  "manifest": coalesce(
    subjectOfManifest, 
    "${BASE_PATH}/api/manifest/" + _id
  ),
  identifiedBy[] {
    ...,
    hasType[]-> {
      ...
    },
    language[]-> {
      ...
    }
  },
  activityStream[]{
    _type == 'reference' => @->{
      ...,
      contributionAssignedBy[]{
        ...,
        assignedActor->{
          _id,
          label,
          image {
            asset->{
              ...,
              metadata
            }
          },
        }
      },
      usedGeneralTechnique[]->{
        _id,
        label
      },
    },
    ...,
    hasType[accessState == 'open']-> {
      ...
    },
    tookPlaceAt[]->,
    movedFrom->{
      _id,
      label,
      geoJSON
    },
    movedTo->{
      _id,
      label,
      geoJSON
    },
    contributionAssignedBy[]{
      ...,
      assignedActor->{
        _id,
        label,
        image {
          asset->{
            ...,
            metadata
          }
        },
      }
    },
    usedGeneralTechnique[]->{
      _id,
      label,
    },
    target->{
      _id,
      label,
      image {
        asset->{
          ...,
          metadata
        }
      },
    }
  },
  "excerpt": pt::text(referredToBy[0].body),
  referredToBy[] {
    ...,
    body[] {
      ...,
      _type == 'reference' => @->{
        _id,
        _type,
        preferredIdentifier,
        label,
        subjectOfManifest,
        image {
          asset->{
            ...,
            metadata
          }
        },
      }
    },
    hasType-> {
      _id,
      label,
    },
    creator{
      "_id": assignedActor->._id,
      "label": assignedActor->.label,
    },
    "language": language->.identifiedByISO6393
  },
  hasCurrentOwner[]-> {
    _id,
    label,
    image {
      asset->{
        ...,
        metadata
      }
    },
  },
  subject[]-> {
    _id,
    label,
  },
  consistsOf[]-> {
    _id,
    label,
  },
  measurement[] {
    ...,
    observedDimension[] {
      ...,
      hasType->{
        label,
      },
      hasUnit->{
        label,
      },
    }
  }
}`
