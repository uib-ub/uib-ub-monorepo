import DocumentsPane from 'sanity-plugin-documents-pane'
import { RiMapPinLine } from 'react-icons/ri'
import { TiUser } from 'react-icons/ti'
import { MdOutlineEmojiObjects, MdEvent } from 'react-icons/md'
import { FaMapMarkedAlt, FaGifts, FaGlasses, FaProjectDiagram, FaBookOpen, FaBookDead, FaTags, FaSitemap, FaRoute } from 'react-icons/fa'
import { GoMegaphone as BlogIcon, GoArchive as AllIcon } from 'react-icons/go'
import { ImLibrary } from 'react-icons/im'
import { CgTemplate } from 'react-icons/cg'
import { BsFileRichtext } from 'react-icons/bs'
import { GiBoltSpellCast, GiSettingsKnobs, GiCrackedGlass } from 'react-icons/gi'
import { FiActivity } from 'react-icons/fi'

const i18nConfig = {
  base: "no",
  languages: [
    {
      "id": "en",
      "title": "English"
    },
    {
      "id": "no",
      "title": "Bokmål"
    }
  ]
}

export const defaultDocumentNode = (S, { schemaType }) => {
  return S.document().views([
    S.view.form(),
    S.view.component(DocumentsPane)
      .options({
        query: `*[!(_id in path("drafts.**")) && references($id)]`,
        params: { id: `_id` },
        useDraft: false,
        debug: true,
      })
      .title('Referanser')
  ])
}

const hiddenDocTypes = (listItem) =>
  ![
    'HumanMadeObject',
    'Collection',
    'Actor',
    'Period',
    'Event',
    'Activity',
    'LinguisticObject',
    'Report',
    'Acquisition',
    'Move',
    'DesignOrProcedure',
    'Timeline',
    'Exhibition',
    'Project',
    'SiteSettings',
    'Place',
    'SystemCategory',
    'Concept',
    'Material',
    'Work',
    'VisualItem',
    'Language',
    'ObjectType',
    'PlaceType',
    'EventType',
    'ExhibitionType',
    'ActorType',
    'TextType',
    'WorkType',
    'Technique',
    'StorageType',
    'ReportType',
    'MeasurementUnit',
    'IdentifierType',
    'DimensionType',
    'ConditionType',
    'ActivityType',
    'AcquisitionType',
    'AppelationType',
    'Role',
    'NavigationMenu',
    'navigationItem',
    'Page',
    'Post',
    'Route',
    'Toc',
    'Storage',
    'LinguisticDocument',
    'media.tag',
    'Transformation',
    'Modification',
    'Production',
    'Measurement',
    'Joining',
    'Leaving',
    'Formation',
    'Dissolution',
    'Birth',
    'Death',
    'BeginningOfExistence',
    'Creation',
    'Destruction',
    'hierarchy.tree'
  ].includes(listItem.getId())


export const structure = (S, context) =>
  S.list()
    .id('__root__')
    .title('Innhold')
    .items([
      S.listItem()
        .title('Formidling')
        .icon(FaSitemap)
        .child(
          S.list()
            .title('Formidling')
            .items([
              // SETTINGS SINGLETON
              S.listItem()
                .title('Nettsideinnstillinger')
                .icon(GiSettingsKnobs)
                .child(S.editor().id('siteSettings').schemaType('SiteSettings').documentId('siteSettings')),
              S.listItem()
                .title('Sider')
                .icon(CgTemplate)
                .schemaType('Page')
                .child(
                  S.documentList('Page')
                    .title('Sider')
                    .schemaType('Page')
                    .filter(`_type == "Page" && !(_id match "**home") && __i18n_lang == $baseLanguage`)
                    .params({ baseLanguage: i18nConfig.base })
                    .canHandleIntent(S.documentTypeList('Page').getCanHandleIntent())
                ),
              S.listItem()
                .title('Tekster')
                .icon(BsFileRichtext)
                .child(
                  S.list()
                    .title('Tekster')
                    .items([
                      S.listItem()
                        .title('Alle tekster')
                        .icon(FaGlasses)
                        .child(
                          S.documentList('LinguisticDocument')
                            .title('Alle tekster')
                            .schemaType('LinguisticDocument')
                            .filter(`_type == "LinguisticDocument" && __i18n_lang == $baseLanguage`)
                            .params({ baseLanguage: i18nConfig.base })
                            .canHandleIntent(S.documentTypeList('LinguisticDocument').getCanHandleIntent())
                        ),
                      S.listItem()
                        .title('Tekster etter type')
                        .icon(FaGlasses)
                        .child(
                          // List out all categories
                          S.documentTypeList('TextType')
                            .title('Tekster etter type')
                            .filter('_type == "TextType"')
                            .child((catId) =>
                              // List out project documents where the _id for the selected
                              // category appear as a _ref in the project’s categories array
                              S.documentList()
                                .schemaType('LinguisticDocument')
                                .title('Tekster')
                                .filter('_type == "LinguisticDocument" && $id in hasType[]._ref && __i18n_lang == $baseLanguage')
                                .params({ id: catId, baseLanguage: i18nConfig.base })
                                .canHandleIntent(S.documentTypeList('LinguisticDocument').getCanHandleIntent())
                            ),
                        ),
                      S.divider(),
                      S.documentTypeListItem('TextType').title('Tekststype'),
                    ]),
                ),
              S.listItem()
                .title('Blogg')
                .icon(BlogIcon)
                .child(
                  S.list()
                    .title('/blog')
                    .items([
                      S.listItem()
                        .title('Publiserte blogginnlegg')
                        .schemaType('Post')
                        .icon(BlogIcon)
                        .child(
                          S.documentTypeList('Post')
                            .title('Publiserte blogginnlegg')
                            .menuItems(S.documentTypeList('Post').getMenuItems())
                            .filter('_type == "Post" && publishedAt < now() && !(_id in path("drafts.**"))'),
                          // .child((documentId) =>
                          //     S.document()
                          //       .documentId(documentId)
                          //       .schemaType('Post')
                          //       .views([S.view.form(), PreviewIFrame()])
                          //   )
                        ),
                      S.documentTypeListItem('Post')
                        .title('Alle blogginnlegg')
                        .icon(
                          AllIcon,
                        ),
                      // S.listItem()
                      //   .title('Post by author')
                      //   .child(
                      //     S.documentTypeList('actor')
                      //       .title('Post by author')
                      //       .filter(
                      //         '_type == "actor" && count(*[_type=="Post" && ^._id in authors[]->.actor._ref]) > 0'
                      //       )
                      //       .child(id =>
                      //       // List out project documents where the _id for the selected
                      //       // category appear as a _ref in the project’s categories array
                      //         S.documentList()
                      //           .schemaType('Post')
                      //           .title('Blogs')
                      //           .filter(
                      //             '_type == "Post" && $id in authors[].actor._ref'
                      //           )
                      //           .params({id})
                      //       )
                      //   ),
                    ]),
                ),
              S.divider(),
              /* createDeskHierarchy({
                title: 'Hovedmeny',
                // The hierarchy will be stored in this document ID 👇
                documentId: 'main-nav',
                // Document types editors should be able to include in the hierarchy
                referenceTo: ['Route'],
                // ❓ Optional: provide filters and/or parameters for narrowing which documents can be added
                // referenceOptions: {
                //   filter: 'status in $acceptedStatuses',
                //   filterParams: {
                //     acceptedStatuses: ['published', 'approved']
                //   }
                // },
                // ❓ Optional: limit the depth of your hierarachies
                maxDept: 3
              }), */
              S.listItem()
                .title('Stier')
                .icon(FaRoute)
                .schemaType('Route')
                .child(
                  S.documentTypeList('Route')
                    .title('Stier')
                ),
              S.listItem()
                .title('Innholdsfortegnelse')
                .icon(GiSettingsKnobs)
                .child(S.editor().schemaType('ToC').documentId('mainNav')),
            ]),
        ),
      S.listItem()
        .title('Administrasjon')
        .icon(ImLibrary)
        .child(
          S.list()
            .title('Administrasjon')
            .items([
              S.documentTypeListItem('Collection').title('Samlinger'),
              S.listItem()
                .title('Akkvisisjoner')
                .icon(FaGifts)
                .child(
                  S.list()
                    .title('Akkvisisjoner')
                    .items([
                      S.listItem()
                        .title('Alle akkvisisjoner')
                        .icon(FaGifts)
                        .child(S.documentTypeList('Acquisition').title('Alle akkvisisjoner')),
                      S.listItem()
                        .title('Akkvisisjoner etter type')
                        .icon(FaGifts)
                        .child(
                          // List out all categories
                          S.documentTypeList('AcquisitionType')
                            .title('Akkvisisjoner etter type')
                            .filter('_type == "AcquisitionType"')
                            .child((catId) =>
                              // List out project documents where the _id for the selected
                              // category appear as a _ref in the project’s categories array
                              S.documentList()
                                .schemaType('Acquisition')
                                .title('Akkvisisjoner')
                                .filter('_type == "Acquisition" && $catId in hasType[]._ref')
                                .params({ catId }),
                            ),
                        ),
                      S.listItem().title('Upubliserte akkvisisjoner').icon(FaGifts).child(
                        // List out all categories
                        S.documentTypeList('Acquisition')
                          .title('Upubliserte akkvisisjoner')
                          .filter('_type == "Acquisition" && accessState == "secret"'),
                      ),
                      S.listItem().title('Til gjennomgang').icon(FaGifts).child(
                        // List out all categories
                        S.documentTypeList('Acquisition')
                          .title('Til gjennomgang')
                          .filter('_type == "Acquisition" && editorialState == "review"'),
                      ),
                      S.divider(),
                      S.documentTypeListItem('AcquisitionType').title('Akkvisisjonstype'),
                    ]),
                ),
              S.listItem()
                .title('Utstillinger')
                .icon(FaGlasses)
                .child(
                  S.list()
                    .title('Utstillinger')
                    .items([
                      S.listItem()
                        .title('Alle utstillinger')
                        .icon(FaGlasses)
                        .child(S.documentTypeList('Exhibition').title('Alle utstillinger')),
                      S.listItem()
                        .title('Utstillinger etter type')
                        .icon(FaGlasses)
                        .child(
                          // List out all categories
                          S.documentTypeList('ExhibitionType')
                            .title('Utstillinger etter type')
                            .filter('_type == "ExhibitionType"')
                            .child((catId) =>
                              // List out project documents where the _id for the selected
                              // category appear as a _ref in the project’s categories array
                              S.documentList()
                                .schemaType('Exhibition')
                                .title('Utstillinger')
                                .filter('_type == "Exhibition" && $catId in hasType[]._ref')
                                .params({ catId })
                            ),
                        ),
                      S.listItem().title('Upubliserte utstillinger').icon(FaGlasses).child(
                        // List out all categories
                        S.documentTypeList('Exhibition')
                          .title('Upubliserte utstillinger')
                          .filter('_type == "Exhibition" && accessState == "secret"'),
                      ),
                      S.listItem().title('Til gjennomgang').icon(FaGlasses).child(
                        // List out all categories
                        S.documentTypeList('Exhibition')
                          .title('Til gjennomgang')
                          .filter('_type == "Exhibition" && editorialState == "review"'),
                      ),
                    ]),
                ),
              S.documentTypeListItem('DesignOrProcedure').title('Design eller prosedyre'),
              S.listItem()
                .title('Rapport')
                .icon(GiCrackedGlass)
                .child(
                  S.list()
                    .title('Rapport')
                    .items([
                      S.listItem()
                        .title('Alle rapporter')
                        .icon(GiCrackedGlass)
                        .child(S.documentTypeList('Report').title('Alle rapporter')),
                      S.listItem()
                        .title('Rapport etter type')
                        .icon(GiCrackedGlass)
                        .child(
                          // List out all categories
                          S.documentTypeList('ReportType')
                            .title('Rapport etter type')
                            .filter('_type == "ReportType"')
                            .child((catId) =>
                              // List out project documents where the _id for the selected
                              // category appear as a _ref in the project’s categories array
                              S.documentList()
                                .schemaType('Report')
                                .title('Rapport')
                                .filter('_type == "Report" && $catId in hasType[]._ref')
                                .params({ catId }),
                            ),
                        ),
                      S.listItem().title('Upubliserte rapporter').icon(GiCrackedGlass).child(
                        // List out all categories
                        S.documentTypeList('Report')
                          .title('Upubliserte rapporter')
                          .filter('_type == "Report" && accessState == "secret"'),
                      ),
                      S.listItem().title('Til gjennomgang').icon(GiCrackedGlass).child(
                        // List out all categories
                        S.documentTypeList('Report')
                          .title('Til gjennomgang')
                          .filter('_type == "Report" && editorialState == "review"'),
                      ),
                    ]),
                ),
              S.documentTypeListItem('Storage').title('Lagrinsenheter'),
              S.listItem()
                .title('Prosjekter')
                .icon(FaProjectDiagram)
                .child(
                  S.list()
                    .title('Prosjekter')
                    .items([
                      S.listItem()
                        .title('Alle prosjekter')
                        .icon(FaProjectDiagram)
                        .child(S.documentTypeList('Project').title('Alle prosjekter')),
                      S.listItem().title('Active projects').icon(FaProjectDiagram).child(
                        // List out all categories
                        S.documentTypeList('Project')
                          .title('Active projects')
                          .filter('_type == "Project" && active'),
                      ),
                      S.listItem().title('Completed projects').icon(FaProjectDiagram).child(
                        // List out all categories
                        S.documentTypeList('Project')
                          .title('Completed projects')
                          .filter('_type == "Project" && !active'),
                      ),
                    ]),
                ),
              S.divider(),
              S.documentTypeListItem('Material').title('Material'),
              S.documentTypeListItem('AcquisitionType').title('Akkvisisjonstype'),
              S.documentTypeListItem('ConditionType').title('Tilstandstype'),
              S.documentTypeListItem('ExhibitionType').title('Utstillingstype'),
              S.documentTypeListItem('StorageType').title('Lagringstype'),
              S.documentTypeListItem('ReportType').title('Rapporttype'),
              S.documentTypeListItem('MeasurementUnit').title('Måleenhet'),
              S.documentTypeListItem('DimensionType').title('Dimensjonstype'),
            ])),
      S.divider(),
      S.listItem()
        .title('Verk')
        .icon(MdOutlineEmojiObjects)
        .child(
          S.list()
            .title('Verk')
            .items([
              S.documentTypeListItem('Work').title('Verk'),
              S.documentTypeListItem('VisualItem').title('Visuell ting'),
              S.divider(),
              S.documentTypeListItem('WorkType').title('Verkstype'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Objekt')
        .icon(FaBookDead)
        .child(
          S.list()
            .title('Objekter')
            .items([
              S.listItem()
                .title('Alle objekter')
                .icon(FaBookOpen)
                .child(S.documentTypeList('HumanMadeObject').title('Alle objekter')),
              S.listItem()
                .title('Objekt etter type')
                .icon(FaBookOpen)
                .child(
                  // List out all categories
                  S.documentList('objectType')
                    .schemaType('objectType')
                    .title('Objekt etter type')
                    .filter('_type == "ObjectType"')
                    .child((objectTypeId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentList()
                        .schemaType('HumanMadeObject')
                        .title('Objekt')
                        .filter('_type == "HumanMadeObject" && $objectTypeId in hasType[]._ref')
                        .params({ objectTypeId })
                        .initialValueTemplates([
                          S.initialValueTemplateItem('humanMadeObjectWithType', { objectTypeId })
                        ])
                    ),
                ),
              S.listItem().title('Upubliserte objekter').icon(FaBookOpen).child(
                // List out all categories
                S.documentTypeList('HumanMadeObject')
                  .title('Upubliserte objekter')
                  .filter('_type == "HumanMadeObject" && accessState == "secret"'),
              ),
              S.listItem().title('Til gjennomgang').icon(FaBookOpen).child(
                // List out all categories
                S.documentTypeList('HumanMadeObject')
                  .title('Til gjennomgang')
                  .filter('_type == "HumanMadeObject" && editorialState == "review"'),
              ),
              S.divider(),
              S.documentTypeListItem('ObjectType').title('Objekttype'),
            ]),
        ),
      S.listItem()
        .title('Aktører')
        .icon(TiUser)
        .child(
          S.list()
            .title('Aktører')
            .items([
              S.listItem()
                .title('Alle Aktører')
                .icon(TiUser)
                .child(S.documentTypeList('Actor').title('Alle Aktører')),
              S.listItem()
                .title('Aktører etter type')
                .icon(TiUser)
                .child(
                  // List out all categories
                  S.documentTypeList('ActorType')
                    .title('Aktører etter type')
                    .filter('_type == "ActorType"')
                    .child((actorTypeId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentList()
                        .schemaType('Actor')
                        .title('Aktører')
                        .filter('_type == "Actor" && $actorTypeId in hasType[]._ref')
                        .params({ actorTypeId })
                        .initialValueTemplates([
                          S.initialValueTemplateItem('actorWithType', { actorTypeId })
                        ])
                    ),
                ),
              S.listItem().title('Upubliserte aktører').icon(TiUser).child(
                // List out all categories
                S.documentTypeList('Actor')
                  .title('Upubliserte aktører')
                  .filter('_type == "Actor" && accessState == "secret"'),
              ),
              S.listItem().title('Til gjennomgang').icon(TiUser).child(
                // List out all categories
                S.documentTypeList('Actor')
                  .title('Til gjennomgang')
                  .filter('_type == "Actor" && editorialState == "review"'),
              ),
              S.divider(),
              S.documentTypeListItem('ActorType').title('Aktørtype'),
              S.documentTypeListItem('Role').title('Rolle'),
            ]),
        ),
      S.listItem()
        .title('Steder')
        .icon(RiMapPinLine)
        .child(
          S.list()
            .title('Steder')
            .items([
              S.listItem()
                .title('Alle steder')
                .icon(RiMapPinLine)
                .child(S.documentTypeList('Place').title('Alle steder')),
              S.listItem()
                .title('Steder etter type')
                .icon(FaMapMarkedAlt)
                .child(
                  // List out all categories
                  S.documentTypeList('PlaceType')
                    .title('Steder etter type')
                    .filter('_type == "PlaceType"')
                    .child((catId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentList()
                        .schemaType('Place')
                        .title('Steder')
                        .filter('_type == "Place" && $catId in hasType[]._ref')
                        .params({ catId }),
                    ),
                ),
              S.divider(),
              S.documentTypeListItem('PlaceType').title('Stedstype'),
            ]),
        ),
      S.documentTypeListItem('Period').title('Perioder'),
      S.listItem()
        .title('Hendelser')
        .icon(MdEvent)
        .child(
          S.list()
            .title('Hendelser')
            .items([
              S.listItem()
                .title('Alle hendelser')
                .icon(MdEvent)
                .child(S.documentTypeList('Event').title('Alle hendelser')),
              S.listItem()
                .title('Hendelser etter type')
                .icon(MdEvent)
                .child(
                  // List out all categories
                  S.documentTypeList('EventType')
                    .title('Hendelser etter type')
                    .filter('_type == "EventType"')
                    .child((catId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentList()
                        .schemaType('Event')
                        .title('Hendelser')
                        .filter('_type == "Event" && $catId in hasType[]._ref')
                        .params({ catId }),
                    ),
                ),
              S.divider(),
              S.documentTypeListItem('EventType').title('Hendelsestype'),
            ]),
        ),
      // ACTIVITY
      S.listItem()
        .title('Aktiviteter')
        .icon(FiActivity)
        .child(
          S.list()
            .title('Aktiviteter')
            .items([
              S.listItem()
                .title('Aktiviteter')
                .icon(GiBoltSpellCast)
                .child(
                  S.list()
                    .title('Aktiviteter')
                    .items([
                      S.listItem()
                        .title('Aktiviteter etter type')
                        .icon(GiBoltSpellCast)
                        .child(
                          // List out all categories
                          S.documentTypeList('ActivityType')
                            .title('Aktiviteter etter type')
                            .filter('_type == "ActivityType"')
                            .child((catId) =>
                              // List out project documents where the _id for the selected
                              // category appear as a _ref in the project’s categories array
                              S.documentList()
                                .schemaType('Activity')
                                .title('Aktiviteter')
                                .filter('_type == "Activity" && $catId in hasType[]._ref')
                                .params({ catId }),
                            ),
                        ),
                      S.listItem()
                        .title('Alle aktiviteter')
                        .icon(GiBoltSpellCast)
                        .child(S.documentTypeList('Activity').title('Alle aktiviteter')),
                      S.divider(),
                      S.documentTypeListItem('ActivityType').title('Aktivitetstype'),
                    ]),
                ),
              S.divider(),
              S.documentTypeListItem('Production').title('Produksjon'),
              S.documentTypeListItem('Creation').title('Skapelse (ikke fysisk)'),
              S.documentTypeListItem('Transformation').title('Transformasjon'),
              S.documentTypeListItem('Modification').title('Modifikasjon'),
              S.documentTypeListItem('Destruction').title('Ødeleggelse'),
              S.documentTypeListItem('Measurement').title('Måling'),
              S.documentTypeListItem('Technique').title('Teknikk'),
              S.divider(),
              //S.documentTypeListItem('EndOfExistence').title('Slutt på eksistens'),
              //S.documentTypeListItem('BeginningOfExistence').title('Start på eksistens'),
              S.documentTypeListItem('Birth').title('Fødsel'),
              S.documentTypeListItem('Death').title('Død'),
              S.divider(),
              S.documentTypeListItem('Formation').title('Opprettelse'),
              S.documentTypeListItem('Dissolution').title('Oppløsning'),
              S.documentTypeListItem('Joining').title('Innlemmelse'),
              S.documentTypeListItem('Leaving').title('Utmelding'),
            ]),
        ),
      // Much used types
      S.divider(),
      S.documentTypeListItem('Concept').title('Emner'),
      // TYPE
      S.listItem()
        .title('...andre typer')
        .icon(FaTags)
        .child(
          S.list()
            .title('Typer')
            .items([
              S.documentTypeListItem('IdentifierType').title('IdentifikatorType'),
              S.documentTypeListItem('AppelationType').title('Navnetype'),
              S.documentTypeListItem('Language').title('Språk'),
            ]),
        ),
      S.divider(),
      // This returns an array of all the document types
      // defined in schema.js. We filter out those that we have
      // defined the structure above
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ])
