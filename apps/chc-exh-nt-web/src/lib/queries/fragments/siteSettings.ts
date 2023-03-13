import { groq } from 'next-sanity'

const ROUTE = groq`
    ...,
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
      _type == 'GridBlock' => @{
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
      _type == 'PublicationBlock' => @{
        ...,
        "objectDescription": internalRef-> {
          _id,
          label,
          image {
            alt,
            asset->{
              ...,
              metadata
            }
          },
          "file": file.asset->.url,
        },
      }
    },
  `

export const siteSettings = groq`
  "siteSettings": *[_id == "siteSettings"][0] {
    ...,
    publisher[]->{
      _id,
      label,
      image
    },
    identifiedBy[] {
      "title": coalesce(part[hasType._ref == "be414a5e-3f47-47ff-8af3-19b443808c01"].content, content),
      "subtitle": part[hasType._ref == "e651aeac-8440-4669-87cb-16ae95d8d914"].content,
      "language": language[]->.identifiedByISO6393
    },
    image {
      asset->{
        ...,
        metadata
      },
      "palette": asset->.metadata.palette,
    },
    "frontpage": *[__i18n_base._ref match ^.frontpage._ref && __i18n_lang == $language]{${ROUTE}},
    "fallback": *[_id match ^.frontpage._ref && __i18n_lang == $language]{${ROUTE}},
  }
`
