// /deskStructure.js
//import DocumentsPane from 'sanity-plugin-documents-pane'
// import { createDeskHierarchy } from '@sanity/hierarchical-document-list'
import { GoDatabase, GoFileCode, GoLightBulb, GoPackage, GoPerson, GoProject } from 'react-icons/go'
import { GrCloudSoftware } from 'react-icons/gr'
import { BiCodeAlt, BiGroup } from 'react-icons/bi'
import { MdDesignServices, MdOutlineEvent } from 'react-icons/md'
import { AiOutlineApi } from 'react-icons/ai'
import { GiTeamIdea } from 'react-icons/gi'

const icons = {
  project: GoProject,
  product: GoPackage,
  software: GrCloudSoftware,
  sourcecode: GoFileCode,
  programminglanguage: BiCodeAlt,
  service: MdDesignServices,
  dataset: GoDatabase,
  accesspoint: AiOutlineApi,
  actor: GoPerson,
  group: BiGroup,
  team: GiTeamIdea,
  autority: GoLightBulb,
  event: MdOutlineEvent
}

export const getDefaultDocumentNode = () => {
  // Give all documents the JSON preview, 
  // as well as the default form view
  return S.document().views([
    S.view.form(),
    S.view.component(DocumentsPane)
      .options({
        query: `*[!(_id in path("drafts.**")) && references($id)]`,
        params: { id: `_id` },
        useDraft: false,
        debug: true,
      })
      .title('Incoming References')
  ])
}


export const deskStructure = (S) =>
  S.list()
    .title('Innhold')
    .items([
      S.documentTypeListItem('Project')
        .icon(icons.project),
      S.documentTypeListItem('Actor')
        .icon(icons.actor),
      S.listItem()
        .title('Grupper')
        .icon(icons.group)
        .child(
          S.list()
            .title('Grupper')
            .items([
              S.listItem()
                .title('Alle grupper')
                .child(
                  S.documentTypeList('Group')
                ),
              S.listItem()
                .title('Grupper etter type')
                .icon(icons.group)
                .child(
                  // List out all categories
                  S.documentList('GroupType')
                    .schemaType('GroupType')
                    .title('Grupper etter type')
                    .filter('_type == "GroupType"')
                    .child((groupTypeId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentList()
                        .schemaType('Group')
                        .title('Gruppe')
                        .filter('_type == "Group" && $groupTypeId in hasType[]._ref')
                        .params({ groupTypeId })
                    ),
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem('Product')
        .icon(icons.product),
      S.listItem()
        .title('Programvare')
        .icon(icons.software)
        .child(
          S.list()
            // Sets a title for our new list
            .title('Programvare og kildekode')
            // Add items to the array
            // Each will pull one of our new singletons
            .items([
              S.listItem()
                .title('Programvare etter eier')
                //.icon(FaGlasses)
                .child(
                  // List out all categories
                  S.documentTypeList('Group')
                    .title('Programvareeiere')
                    // This should be possible => .filter('_type == "Group" && _id in *[_type in ["Software", "VolatileSoftware"]].maintainedBy[]._ref')
                    .filter('_type == "Group"')
                    .child((param) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentList()
                        .schemaType('Software')
                        .title('Programvare')
                        .filter('_type in ["Software", "VolatileSoftware"] && $param in maintainedBy[]._ref')
                        .params({ param }),
                    ),
                ),
              S.listItem()
                .title('Alle programvarer')
                .child(
                  S.documentTypeList('Software')
                ),
              S.listItem()
                .title('Kildekode')
                .child(
                  S.documentTypeList('VolatileSoftware')
                ),
              S.listItem()
                .title('Programmeringsspråk')
                .child(
                  S.documentTypeList('ProgrammingLanguage')
                ),
              S.listItem()
                .title('Dataskjema (ala CIDOC-CRM)')
                .child(
                  S.documentTypeList('Schema')
                ),
              S.listItem()
                .title('Format (ala JSON, XML)')
                .child(
                  S.documentTypeList('EncodingType')
                ),
            ])),
      S.listItem()
        .title('Tjenester')
        .icon(icons.service)
        .child(
          S.list()
            // Sets a title for our new list
            .title('Tjenester')
            // Add items to the array
            // Each will pull one of our new singletons
            .items([
              S.listItem()
                .title('Data/kildekode-tjenester')
                .child(
                  S.documentTypeList('HostingService')
                ),
              S.listItem()
                .title('Plattform/server-tjenester')
                .child(
                  S.documentTypeList('SoftwareComputingEService')
                ),
              S.listItem()
                .title('Verttjenester (tenk GitHub)')
                .child(
                  S.documentTypeList('SoftwareDeliveryEService')
                ),
              S.listItem()
                .title('Utviklingstjenester')
                .child(
                  S.documentTypeList('SoftwareCuratingService')
                ),
            ])),
      S.documentTypeListItem('Dataset')
        .icon(icons.dataset),
      S.documentTypeListItem('AccessPoint')
        .icon(icons.accesspoint),
      S.documentTypeListItem('Endpoint')
        .icon(icons.accesspoint),
      S.divider(),
      S.listItem()
        .title('Autoriteter')
        .icon(icons.autority)
        .child(
          S.list()
            // Sets a title for our new list
            .title('Autoriteter')
            // Add items to the array
            // Each will pull one of our new singletons
            .items([
              S.listItem()
                .title('Emner')
                .child(
                  S.documentTypeList('Concept')
                ),
              S.listItem()
                .title('Aktivitetstyper')
                .child(
                  S.documentTypeList('ActivityType')
                ),
              S.listItem()
                .title('Kompetansetyper')
                .child(
                  S.documentTypeList('CompetenceType')
                ),
              S.listItem()
                .title('Hendelsestyper')
                .child(
                  S.documentTypeList('EventType')
                ),
              S.listItem()
                .title('Gruppetyper')
                .child(
                  S.documentTypeList('GroupType')
                ),
              S.listItem()
                .title('Identifikatortyper')
                .child(
                  S.documentTypeList('IdentifierType')
                ),
              S.listItem()
                .title('Navnetyper')
                .child(
                  S.documentTypeList('NameType')
                ),
              S.listItem()
                .title('Språk (ikke bruk)')
                .child(
                  S.documentTypeList('Language')
                ),
              S.listItem()
                .title('Programmeringsspråk')
                .child(
                  S.documentTypeList('ProgrammingLanguage')
                ),
              S.listItem()
                .title('Protokoll (som HTTP)')
                .child(
                  S.documentTypeList('ProtocolType')
                ),
              S.listItem()
                .title('Plattform')
                .child(
                  S.documentTypeList('Platform')
                ),
              S.listItem()
                .title('Rolle')
                .child(
                  S.documentTypeList('Role')
                ),
              S.listItem()
                .title('Sted')
                .child(
                  S.documentTypeList('Place')
                ),
              S.listItem()
                .title('Valuta')
                .child(
                  S.documentTypeList('Currency')
                ),
            ])),
      S.divider(),
      S.listItem()
        .title('Hendelser og aktiviteter')
        .icon(icons.event)
        .child(
          S.list()
            // Sets a title for our new list
            .title('Hendelser og aktiviteter')
            // Add items to the array
            // Each will pull one of our new singletons
            .items([
              S.listItem()
                .title('Hendelser')
                .child(
                  S.documentTypeList('Event')
                ),
              S.listItem()
                .title('Aktivitet (generisk)')
                .child(
                  S.documentTypeList('Activity')
                ),
              S.listItem()
                .title('Finansiering')
                .child(
                  S.documentTypeList('FundingActivity')
                ),
              S.listItem()
                .title('Opprettelse')
                .child(
                  S.documentTypeList('Formation')
                ),
              S.listItem()
                .title('Nedleggelse')
                .child(
                  S.documentTypeList('Dissolution')
                ),
              S.listItem()
                .title('Innlemmelse')
                .child(
                  S.documentTypeList('Joining')
                ),
              S.listItem()
                .title('Utmeldelse')
                .child(
                  S.documentTypeList('Leaving')
                ),
              S.listItem()
                .title('Overføring (personell)')
                .child(
                  S.documentTypeList('TransferOfMember')
                ),
              S.listItem()
                .title('Flytting')
                .child(
                  S.documentTypeList('Move')
                ),
              S.listItem()
                .title('Start på tilværelse')
                .child(
                  S.documentTypeList('BeginningOfExistence')
                ),
              S.listItem()
                .title('Slutt på tilværelse')
                .child(
                  S.documentTypeList('EndOfExistence')
                ),
              S.listItem()
                .title('Fødsel')
                .child(
                  S.documentTypeList('Birth')
                ),
              S.listItem()
                .title('Død')
                .child(
                  S.documentTypeList('Death')
                )
            ])
        ),
      // ...S.documentTypeListItems().filter(listItem => !['Endpoint', 'Actor', 'Group', 'Place', 'Platform', 'Dataset', 'Role', 'Concept', 'Software', 'Language', 'media.tag', 'Activity', 'Event', 'Move', 'Formation', 'Dissolution', 'Joining', 'Leaving', 'BeginningOfExistence', 'EndOfExistence', 'Birth', 'Death', 'Product', 'Project', 'Service'].includes(listItem.getId()))
    ])