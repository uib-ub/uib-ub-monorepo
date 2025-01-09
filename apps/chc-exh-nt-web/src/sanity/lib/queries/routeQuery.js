import { groq } from 'next-sanity'

const ROUTE_CONTENT = groq`
  ...,
  "excerpt": pt::text(excerpt),
  "headings": body[length(style) == 2 && string::startsWith(style, "h")],
  creator[] {
    ...,
    assignedActor-> {
      _id,
      label
    },
    assignedRole-> {
      _id,
      label
    }
  },
  about-> {
    _id,
    label,
    preferredIdentifier,
    hasCurrentOwner[]->{
      _id,
      label,
    },
    image {
      asset->{
        ...,
        metadata
      }
    },
    "caption": referredToBy[hasType._ref == "a3349c62-4acd-4aaf-8a61-657e232d88be"] {
      ...,
      "language": language->.identifiedByISO6393,
    },
  },
  image {
    alt,
    asset->{
      ...,
      metadata
    }
  },
  body[] {
    ...,
    hasMember[]->{
      "objectDescription": {
          _id,
          label,
          preferredIdentifier,
          hasCurrentOwner[]->{
            _id,
            label,
          },
          "caption": referredToBy[hasType._ref == "a3349c62-4acd-4aaf-8a61-657e232d88be"] {
            ...,
            "language": language->.identifiedByISO6393,
          },
        },
      image {
        alt,
        asset->{
          ...,
          metadata
        }
      }
    },
    _type == 'reference' => @->{
      _id,
      _type,
      label,
      shortDescription,
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
              alt,
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
      image,
      memberOf[]->{
        _id,
        label,
        image {
          alt,
					asset->{
						...,
						metadata
					}
				}
      },
    },
    _type == 'EventSection' && disabled != true => {
      ...,
      item-> {
        _id,
        label,
        timespan,
        location,
        referredToBy[] {
          ...
        },
        image {
          alt,
					asset->{
						...,
						metadata
					}
				},
      }
    },
    _type == 'ObjectBlock' => @{
      ...,
      items[] {
        ...,
        "objectDescription": internalRef-> {
          _id,
          label,
          preferredIdentifier,
          hasCurrentOwner[]->{
            _id,
            label,
          },
          "caption": referredToBy[hasType._ref == "a3349c62-4acd-4aaf-8a61-657e232d88be"] {
            ...,
            "language": language->.identifiedByISO6393,
          },
        },
        "image": coalesce(
          image {
            alt,
            asset->{
              ...,
              metadata
            }
          },
          internalRef->.image {
            alt,
            asset->{
              ...,
              metadata
            }
          },
        ),
        "manifest": coalesce(
          internalRef->.subjectOfManifest, 
          manifestUrl,
          "/api/manifest/" + internalRef->._id
        ),
      }
    },
    _type == 'Set' => @{
      ...,
      hasMember[]-> {
        _id,
        "objectDescription": {
          _id,
          label,
          preferredIdentifier,
          hasCurrentOwner[]->{
            _id,
            label,
          },
          "caption": referredToBy[hasType._ref == "a3349c62-4acd-4aaf-8a61-657e232d88be"] {
            ...,
            "language": language->.identifiedByISO6393,
          },
        },
        image {
          alt,
          asset->{
            ...,
            metadata
          }
        }
      }
    },
    _type == 'HeroBlock' => @{
      ...,
      item {
        ...,
        "objectDescription": internalRef-> {
          _id,
          label,
          preferredIdentifier,
          hasCurrentOwner[]->{
            _id,
            label,
          },
        },
        "image": coalesce(
          image {
            asset->{
              ...,
              metadata
            }
          },
          internalRef->.image {
            asset->{
              ...,
              metadata
            }
          },
        ),
        "manifest": coalesce(
          internalRef->.subjectOfManifest, 
          manifestUrl,
          "/api/manifest/" + internalRef->._id
        ),
      }
    },
  },
  content[] {
    ...,
    _type == 'EventSection' && disabled != true => {
      ...,
      item-> {
        _id,
        label,
        timespan,
        location,
        referredToBy[] {
          ...
        },
        image,
      }
    },
    _type == 'ObjectBlock' => @{
      ...,
      items[] {
        ...,
        "objectDescription": internalRef-> {
          _id,
          label,
          preferredIdentifier,
          hasCurrentOwner[]->{
            _id,
            label,
          },
          "caption": referredToBy[hasType._ref == "a3349c62-4acd-4aaf-8a61-657e232d88be"] {
            ...,
            "language": language->.identifiedByISO6393,
          },
        },
        "image": coalesce(
          alt,
          image {
            asset->{
              ...,
              metadata
            }
          },
          internalRef->.image {
            alt,
            asset->{
              ...,
              metadata
            }
          },
        ),
        "manifest": coalesce(
          internalRef->.subjectOfManifest, 
          manifestUrl,
          "/api/manifest/" + internalRef->._id
        ),
      }
    },
  }`

export const routeQuery = groq`
  *[slug.current == $slug]{
    ...,
    "slug": slug.current,
    "language": page->.language, 
    "translation": *[_type == "translation.metadata" && references(^.page._ref)].translations[].value->{
      ${ROUTE_CONTENT}
    }                                                              
  }
`
