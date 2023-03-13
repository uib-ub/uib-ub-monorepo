import { groq } from 'next-sanity'

export const items = groq`"items": *[_type == "HumanMadeObject"] | order(label){ 
  _id,
  _type,
  label,
  preferredIdentifier,
  homepage,
  hasType[]-> {
    _id,
    label
  },
  image {
    asset->{
      ...,
      metadata
    }
  },
  "excerpt": pt::text(referredToBy[0].body),
  hasCurrentOwner[0]->{
    _id,
    label,
    image {
      asset->{
        ...,
        metadata
      }
    }
  },
  "creation": activityStream[]{
    _type in ["Production", "BeginningOfExistence"] => @{
      "creators": contributionAssignedBy[]{
        "name": assignedActor->.label,
        "_id": assignedActor->._id
      },
      timespan
    }
  },
  "aspectRatio": image.asset->.metadata.dimensions.aspectRatio, 
},`
