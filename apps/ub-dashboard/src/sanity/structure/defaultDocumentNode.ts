import { PREVIEWABLE_DOCUMENT_TYPES } from '../schemas'


// Import this into the deskTool() plugin
export const defaultDocumentNode = (S: any, { schemaType }: { schemaType: any }) => {
  // Check if the schema type is previewable
  if ((PREVIEWABLE_DOCUMENT_TYPES).includes(schemaType)) {
    return S.document().views([
      S.view.form(),
    ])
  }

  return S.document().views([
    // Default form view
    S.view.form(),
  ])
}

