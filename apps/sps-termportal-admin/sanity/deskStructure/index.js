export const deskStructure = S =>
  S.list()
    .title("Project")
    .items([
      S.documentTypeListItem("termbase"),
      S.documentTypeListItem("activity"),
      S.documentTypeListItem("news"),
      S.documentTypeListItem("asset"),
      S.divider(),
      S.documentTypeListItem("person"),
      S.documentTypeListItem("group"),
      S.documentTypeListItem("organization"),
      S.divider(),
      S.documentTypeListItem("scope"),
    ]);

export const defaultDocumentNodeResolver = S =>
  S.document().views([
    S.view.form(),
  ]);
