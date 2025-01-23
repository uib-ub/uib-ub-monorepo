import { type DefaultDocumentNodeResolver } from 'sanity/structure'
/* import { Iframe } from 'sanity-plugin-iframe-pane' */
import { type SanityDocument } from 'sanity'
import { ReferencedBy } from 'sanity-plugin-document-reference-by'
import { PREVIEWABLE_DOCUMENT_TYPES } from '../schemas'

// Customise this function to show the correct URL based on the current document
function getPreviewUrl(doc: SanityDocument) {
  return doc?._id
    ? `${window.location.host}/${doc._id}`
    : `${window.location.host}`
}

// Import this into the deskTool() plugin
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  // Check if the schema type is previewable
  if ((PREVIEWABLE_DOCUMENT_TYPES as string[]).includes(schemaType)) {
    return S.document().views([
      S.view.form(),
      /* S.view
        .component(Iframe)
        .options({
          url: (doc: SanityDocument) => getPreviewUrl(doc),
        })
        .title('Preview'), */
      S.view.component(ReferencedBy).title('Lenker til dokumentet')
    ])
  }

  return S.document().views([
    // Default form view
    S.view.form(),
    S.view.component(ReferencedBy).title('Lenker til dokumentet')
  ])
}

