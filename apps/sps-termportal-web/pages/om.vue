<template>
  <div>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main>
        <template v-if="locale === 'nb'">
          <h1 id="main" class="pb-2 pt-5 text-3xl">
            <AppLink to="#main">{{ $t("om.title") }} </AppLink>
          </h1>
          <div class="max-w-3xl space-y-2">
            <p>
              Dette er nettsiden til Termportalen. Siden er fortsatt under
              utvikling, så en del funksjoner er ikke på plass ennå. Arbeidet
              med å videreutvikle og utvide innholdet pågår kontinuerlig, og
              flere termbaser vil bli gjort tilgjengelig for søk etter hvert som
              de blir importert eller løsning for høsting er på plass. I tillegg
              opprettes det stadig termgrupper, noe som gjør at antall domener
              og mengden terminologi en kan søke i, vil øke jevnt og trutt.
            </p>
            <p>
              Kontakt oss gjerne på
              <AppLink
                class="underline hover:decoration-2"
                to="mailto:termportalen@uib.no"
                >termportalen@uib.no</AppLink
              >
              for spørsmål eller tilbakemeldinger.
            </p>
          </div>
        </template>
        <template v-else-if="locale === 'nn'">
          <Head>
            <Title>{{ $t("om.title") }} | {{ $t("index.title") }}</Title>
          </Head>
          <h1 id="main" class="pb-2 pt-5 text-3xl">
            <AppLink to="#main">{{ $t("om.title") }} </AppLink>
          </h1>
          <div class="max-w-3xl space-y-2">
            <p>
              Dette er nettsida til Termportalen. Sida er framleis under
              utvikling, så ein del funksjonar er enno ikkje på plass. Arbeidet
              med å vidareutvikle og utvide innhaldet går kontinuerleg føre seg,
              og fleire termbasar blir tilgjengelege for søk etter kvart som dei
              blir importerte eller ei løysning for hausting kjem på plass. I
              tillegg blir det stadig oppretta nye termgrupper, derfor vil talet
              på domene og mengda terminologi ein kan søke i, auke jamnt og
              trutt.
            </p>
            <p>
              Kontakt oss gjerne på
              <AppLink
                class="underline hover:decoration-2"
                to="mailto:termportalen@uib.no"
                >termportalen@uib.no</AppLink
              >
              for spørsmål eller tilbakemeldingar.
            </p>
          </div>
        </template>
        <template v-else-if="locale === 'en'">
          <Head>
            <Title>{{ $t("om.title") }} | {{ $t("index.title") }}</Title>
          </Head>
          <h1 id="main" class="pb-2 pt-5 text-3xl">
            <AppLink to="#main">{{ $t("om.title") }} </AppLink>
          </h1>
          <div class="max-w-3xl space-y-2">
            <p>
              This is Termportalen's website. This site is still being developed
              and some features may not be ready yet. The development and
              expansion of Termportalen's contents is ongoing, and more
              termbases will become available and searchable as soon as they are
              imported or a solution for elicitation is ready. In addition, new
              term groups are regularly created and the number of searchable
              domains and terms will therefore be steadily increasing.
            </p>
            <p>
              Please contact us on
              <AppLink
                class="underline hover:decoration-2"
                to="mailto:termportalen@uib.no"
                >termportalen@uib.no</AppLink
              >
              for questions or feedback.
            </p>
          </div>
        </template>
        <Accordion multiple class="mt-6">
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.aboutUs") }}</h2>
            </template>
            <ul class="space-y-1.5">
              <li>
                <AppLink
                  class="underline hover:decoration-2"
                  to="https://www.uib.no/personer/Marita.Kristiansen"
                >
                  Marita Kristiansen, {{ $t("om.maritaStilling") }}
                </AppLink>
              </li>
              <li>
                <AppLink
                  class="underline hover:decoration-2"
                  to="https://www.uib.no/personer/Kurdin.Jacob"
                  >Kurdin Jacob, {{ $t("om.coordinator") }}</AppLink
                >
              </li>
              <li>
                <AppLink
                  class="underline hover:decoration-2"
                  to="https://www.uib.no/personer/Jan.Ole.Bangen"
                  >Jan Ole Bangen, {{ $t("om.developer") }}</AppLink
                >
              </li>
              <li>
                <AppLink
                  class="underline hover:decoration-2"
                  to="https://www.uib.no/personer/Hilde.Johansen"
                  >Hilde Johansen, {{ $t("om.terminologist") }}</AppLink
                >
              </li>
              <li>
                <AppLink
                  class="underline hover:decoration-2"
                  to="https://www.uib.no/en/persons/Tove.Bj%C3%B8rneset"
                  >Tove Bjørneset, {{ $t("om.terminologist") }}</AppLink
                >
              </li>
            </ul>
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.fagrad") }}</h2>
            </template>
            <ContentDoc class="content-page" :path="`/${locale}/om/fagrad`" />
            <ContentDoc
              class="content-page"
              :path="`/${locale}/om/fagrad-mandat`"
            />
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.history") }}</h2>
            </template>
            <div v-if="locale === 'nb' || locale === 'en'" class="space-y-2">
              <p>
                Siden begynnelsen av 2000-tallet har det kommet flere rapporter
                og utredninger som har tatt til orde for en samordning av
                terminologiarbeidet på nasjonalt nivå, slik som
                <AppLinkText
                  to="https://www.sprakradet.no/upload/9832/norsk_i_hundre.pdf"
                  >Norsk i hundre!</AppLinkText
                >
                (2005) og
                <AppLinkText
                  to="https://www.regjeringen.no/no/dokumenter/stmeld-nr-35-2007-2008-/id519923/"
                >
                  St.meld.nr. 35 (2007-2008). Mål og meining. Ein heilskapleg
                  norsk språkpolitikk </AppLinkText
                >. En underliggende motivasjon for dette ønsket har vært den
                stadig økende bruken av engelsk i høyere utdanning og frykten
                for domenetap for norsk som bruksspråk. Høyere utdanning har
                blitt pekt ut som den sentrale sektoren for å få til en nasjonal
                innsats for å ivareta og videreutvikle norsk fagspråk, inkludert
                norsk terminologi.
              </p>
              <p>
                Våren 2020 la regjeringen fram forslag til en helhetlig språklov
                i stortingsproposisjonen
                <AppLinkText
                  to="https://www.regjeringen.no/no/dokumenter/prop.-108-l-20192020/id2701451/"
                  >Prop. 108 L (2019–2020) Lov om språk</AppLinkText
                >
                og pekte der ut Termportalen ved Språksamlingane som et aktuelt
                nasjonalt samordningsmiljø for terminologi:
              </p>
              <blockquote class="space-y-2">
                <p>
                  Termportalen ved språksamlingane ved Universitetet i Bergen,
                  som i dag finst i form av ein fullt funksjonell prototyp, kan
                  utviklast til å bli ein fritt tilgjengeleg ressurs for norsk
                  terminologi innanfor fleire domene, der det er mogleg å søkje
                  på tvers av termbasar og fag. Språksamlingane ønskjer å
                  etablere eit fagmiljø som kan drifte portalen slik at
                  innhaldet kan utviklast vidare til å omfatte terminologi frå
                  viktige domene, både i og utanfor UH-sektoren. Dette
                  fagmiljøet vil òg kunne arbeide med å utvikle nynorsk
                  fagterminologi der det manglar. I Termportalen skal fagfolk
                  kunne lage norske fagtermar, og ulike brukargrupper frå heile
                  samfunnet skal finne fagtermane i eitt søkefelt på tvers av
                  alle relevante lister og basar i dei ulike samfunnssektorane.
                  Termportalen kan derfor bli ein nasjonal infrastruktur for å
                  sikre vidareutviklinga av norsk fagspråk og terminologi. Både
                  Språkrådet og språkmiljø i universitets- og høgskulesektoren
                  har peika på at vidareutvikling og drift av denne prototypen
                  vil vere eit godt bidrag til å styrkje norsk fagspråk.
                </p>
                <p>
                  Regjeringa meiner at Termportalen kan bli eit viktig verktøy
                  som vil bidra til at universiteta og høgskulane oppfyller dei
                  pliktene dei har etter universitets- og høgskulelova § 1-7 og
                  i dei språkpolitiske retningslinjene for kvar institusjon. I
                  tillegg vil Termportalen bidra til at vi når den overordna
                  målsetjinga i framlegget til språklov om å sikre norsk som eit
                  samfunnsberande språk. (s. 72)
                </p>
              </blockquote>
              <p>
                Regjeringen fulgte så opp med en satsing på drift og
                videreutvikling av Termportalen. Denne satsingen var
                samfinansiert av Kunnskapsdepartementet og Kultur- og
                likestillingsdepartementet gjennom en fast rammebevilgning.
              </p>
              <p>
                Med etableringen av Termportalen ved Universitetet i Bergen
                (UiB) i 2021 kan en på mange måter si at ringen er sluttet. Fra
                1980-årene og fram til 1997 eksisterte det et sterkt
                terminologifaglig miljø ved Norsk termbank, UiB. Det var i dette
                miljøet de store nasjonale terminologiprosjektene med
                oljespråket ble gjennomført, og fagmiljøet gjennomførte også
                prosjekter innen for eksempel miljøstandardisering og medisinsk
                terminologi og kodeverk. Terminologien som ble utviklet i disse
                prosjektene, ble samlet i termdatabasen NOT, og er i dag søkbar
                i Termportalen.
              </p>
              <p>
                Termportalen ble opprinnelig utviklet ved NHH og inngikk som en
                arbeidspakke i
                <AppLinkText to="https://clarin.w.uib.no/">CLARINO</AppLinkText
                >, et nasjonalt prosjekt for forskningsinfrastruktur finansiert
                av Norges forskningsråd (NFR) fra 2012. Termportalen ble
                utviklet med finansiering fra NFR og gjennom ansatte ved NHH sin
                eigeninnsats. I 2018 ble ansvaret for drift av Termportalen
                overført fra NHH til Språksamlingane ved UiB. Og med den faste
                rammebevilgningen fra Kunnskapsdepartementet fra og med 2021,
                kunne oppbyggingen av et terminologisk fagmiljø ved
                Universitetsbiblioteket starte for fullt.
              </p>
              <p>
                Våren 2023 kom regjeringens handlingsplan for norsk fagspråk i
                akademia. Ett av tiltakene i handlingsplanen er at det skal tas
                initiativ til å utvikle modeller for samarbeid om
                terminologiutvikling mellom universitetene og høyskolene, og med
                Termportalen.
              </p>
            </div>
            <div v-else class="space-y-2">
              <p>
                Sidan byrjinga av 2000-talet har det kome fleire rapportar og
                utgreiingar som har teke til orde for ei samordning av
                terminologiarbeidet på nasjonalt nivå, slik som
                <AppLinkText
                  to="https://www.sprakradet.no/upload/9832/norsk_i_hundre.pdf"
                  >Norsk i hundre!</AppLinkText
                >
                (2005) og
                <AppLinkText
                  to="https://www.regjeringen.no/no/dokumenter/stmeld-nr-35-2007-2008-/id519923/"
                >
                  St.meld.nr. 35 (2007-2008). Mål og meining. Ein heilskapleg
                  norsk språkpolitikk</AppLinkText
                >. Ein underliggande motivasjon for dette ønsket har vore den
                stadig aukande bruken av engelsk i høgare utdanning og frykta
                for domenetap for norsk som bruksspråk. Høgare utdanning er
                peika ut som den sentrale sektoren for å få til ein nasjonal
                innsats for å ta hand om og vidareutvikle norsk fagspråk,
                inkludert norsk terminologi.
              </p>
              <p>
                Våren 2020 la regjeringa fram sitt framlegg til ei heilskapleg
                språklov i stortingsproposisjonen
                <AppLinkText
                  to="https://www.regjeringen.no/no/dokumenter/prop.-108-l-20192020/id2701451/"
                >
                  Prop. 108 L (2019–2020) Lov om språk
                </AppLinkText>
                og peika der ut Termportalen ved Språksamlingane som eit aktuelt
                nasjonalt samordningsmiljø for terminologi:
              </p>
              <blockquote class="space-y-2">
                <p>
                  Termportalen ved språksamlingane ved Universitetet i Bergen,
                  som i dag finst i form av ein fullt funksjonell prototyp, kan
                  utviklast til å bli ein fritt tilgjengeleg ressurs for norsk
                  terminologi innanfor fleire domene, der det er mogleg å søkje
                  på tvers av termbasar og fag. Språksamlingane ønskjer å
                  etablere eit fagmiljø som kan drifte portalen slik at
                  innhaldet kan utviklast vidare til å omfatte terminologi frå
                  viktige domene, både i og utanfor UH-sektoren. Dette
                  fagmiljøet vil òg kunne arbeide med å utvikle nynorsk
                  fagterminologi der det manglar. I Termportalen skal fagfolk
                  kunne lage norske fagtermar, og ulike brukargrupper frå heile
                  samfunnet skal finne fagtermane i eitt søkefelt på tvers av
                  alle relevante lister og basar i dei ulike samfunnssektorane.
                  Termportalen kan derfor bli ein nasjonal infrastruktur for å
                  sikre vidareutviklinga av norsk fagspråk og terminologi. Både
                  Språkrådet og språkmiljø i universitets- og høgskulesektoren
                  har peika på at vidareutvikling og drift av denne prototypen
                  vil vere eit godt bidrag til å styrkje norsk fagspråk.
                </p>
                <p>
                  Regjeringa meiner at Termportalen kan bli eit viktig verktøy
                  som vil bidra til at universiteta og høgskulane oppfyller dei
                  pliktene dei har etter universitets- og høgskulelova § 1-7 og
                  i dei språkpolitiske retningslinjene for kvar institusjon. I
                  tillegg vil Termportalen bidra til at vi når den overordna
                  målsetjinga i framlegget til språklov om å sikre norsk som eit
                  samfunnsberande språk. (s. 72)
                </p>
              </blockquote>
              <p>
                Regjeringa følgde opp med ei satsing på drift og vidareutvikling
                av Termportalen. Denne satsinga var samfinansiert av
                Kunnskapsdepartementet og Kultur- og likestillingsdepartementet
                gjennom ei fast rammeløyving.
              </p>
              <p>
                Med etableringa av Termportalen ved Universitetet i Bergen (UiB)
                i 2021 kan ein på mange måtar seie at ringen er slutta. Frå
                1980-åra og fram til 1997 eksisterte det eit sterkt
                terminologifagleg miljø ved Norsk termbank, UiB. Det var i dette
                miljøet dei store nasjonale terminologiprosjekta med oljespråket
                vart gjennomført, og fagmiljøet hadde også større prosjekt innan
                mellom anna miljøstandardisering og medisinsk terminologi og
                kodeverk. Terminologien som vart utvikla i desse prosjekta, vart
                samla i termdatabasen NOT, og er i dag søkbar i Termportalen.
              </p>
              <p>
                Dei tekniske løysingane som vart utvikla ved Norsk termbank,
                vart vidareutvikla i KB-N-prosjektet[i] ved Norges
                handelshøyskole (NHH). KB-N-prosjektet hadde finansiering frå
                forskningsrådets KUNSTI-program og kan sjåast som forløparen til
                det som så vart pilotprosjektet Termportalen.
              </p>
              <p>
                Termportalen vart opphavleg utvikla ved NHH som ein arbeidspakke
                i
                <AppLinkText to="https://clarin.w.uib.no/">CLARINO</AppLinkText
                >, eit nasjonalt prosjekt for forskingsinfrastruktur finansiert
                av Noregs forskingsråd (NFR) frå 2012. Termportalen vart utvikla
                med finansiering frå NFR og gjennom tilsette ved NHHs
                eigeninnsats. I 2018 vart ansvaret for drifta av Termportalen
                overført frå NHH til Språksamlingane ved UiB. Med den faste
                rammeløyvinga frå Kunnskapsdepartementet frå og med 2021, kunne
                oppbygginga av eit terminologisk fagmiljø ved
                Universitetsbiblioteket starte for fullt.
              </p>
              <p>
                Våren 2023 kom regjeringa sin handlingsplan for norsk fagspråk i
                akademia. Eitt av tiltaka i handlingsplanen er at det skal
                takast initiativ til å utvikle modellar for samarbeid om
                terminologiutvikling mellom universiteta og høgskolane, og med
                Termportalen.
              </p>
            </div>
            <h3 class="pb-2 pt-6 font-semibold">{{ $t("om.publications") }}</h3>
            <PublicationList>
              <PublicationEntry
                to="http://www.nordterm.net/filer/publikationer/rapporter/Nordterm22.pdf#page=69"
                link-desc="Nordterm"
                >Andersen, Gisle, Peder Gammeltoft og Kjetil Gundersen. 2021.
                Termportalen – fra forprosjekt til fast finansiering. I
                <i>Nordterm</i> 22:
                <i>Begreppsarbete och informationshandetering</i>, 65–76,
              </PublicationEntry>
              <PublicationEntry
                to="http://www.nordterm.net/filer/publikationer/rapporter/Nordterm16_Samlede_indlaeg.pdf#page=210"
                link-desc="Nordterm"
                >Andersen, Gisle og Marita Kristiansen. 2009. Terminor og
                Termportalen – nye initiativer for norsk terminologisk
                infrastruktur. I <i>Nordterm</i> 16:
                <i>Ontologier og taksonomier</i>, 209–222,
              </PublicationEntry>
              <PublicationEntry
                to="https://openaccess.nhh.no/nhh-xmlui/bitstream/handle/11250/2394872/Innselset_Brekke_2004_15_KBN%20%28KunnskapsBank%20for%20Norsk%20%c3%b8konomisk-administrativt%20domene_%20presentasjon%20av%20et%20korpusbasert%20terminologiprosjekt.pdf?sequence=1&isAllowed=y"
              >
                Brekke, Magnar og Kai Innselset. 2004. KB-N (KunnskapsBank for
                Norsk økonomisk-administrativt domene): presentasjon av et
                korpusbasert terminologiprosjekt,
              </PublicationEntry>
              <PublicationEntry
                to="https://www.regjeringen.no/contentassets/1800367dc51846b98a0b33817f03c958/no/pdfs/handlingsplan-fra-ord-til-handling.pdf"
              >
                Frå ord til handling. Handlingsplan for norsk fagspråk i
                akademia. 2023,
              </PublicationEntry>
              <PublicationEntry
                to="https://www.sprakradet.no/globalassets/vi-og-vart/publikasjoner/terminologen-2.pdf#page=52"
              >
                Kristiansen, Marita. 2013. Towards a Norwegian infrastructure
                for terminology. I <i>Terminologen</i> 2:
                <i> Terminologi – ansvar og bevissthet </i>, 53–59,
              </PublicationEntry>
              <PublicationEntry
                to="https://lovdata.no/dokument/LTI/lov/2021-05-21-42"
              >
                Lov om språk (språklova),
              </PublicationEntry>
              <PublicationEntry
                to="https://www.regjeringen.no/no/dokumenter/prop.-126-l-20222023/id2984933/"
                >Prop. 126 L (2022–2023). Lov om universiteter og høyskoler
                (universitets- og høyskoleloven),
              </PublicationEntry>
              <PublicationEntry
                to="https://www.regjeringen.no/no/dokumenter/prop.-108-l-20192020/id2701451/?ch=1"
              >
                Prop. 108 L (2019–2020) Lov om språk (språklova),
              </PublicationEntry>
              <PublicationEntry
                to="https://www.regjeringen.no/contentassets/50816e814a9c46169bd69dc20dd746a3/nn-no/pdfs/stm200720080035000dddpdfs.pdf"
              >
                St.meld.nr. 35 (2007-2008). Mål og meining. Ein heilskapleg
                norsk språkpolitikk,
              </PublicationEntry>
              <PublicationEntry
                to="https://www.sprakradet.no/upload/9832/norsk_i_hundre.pdf"
              >
                Språkrådet 2005. Norsk i hundre! Norsk som nasjonalspråk i
                globaliseringens tidsalder. Et forslag til strategi,
              </PublicationEntry>
            </PublicationList>
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 id="kommeiGang" class="font-semibold">
                {{ $t("om.kommeiGang") }}
              </h2>
            </template>
            <div v-if="locale === 'nb'" class="space-y-2">
              <p>
                Som en del av Termportalens digitale infrastruktur, har vi
                utviklet en
                <AppLinkText
                  to="https://wiki.terminologi.no/index.php?title=Forside"
                  >redigeringsapplikasjon</AppLinkText
                >
                som er et verktøy for registrering av terminologiske data.
                Termgrupper i universitets- og høyskolesektoren og andre som
                ønsker å komme i gang med terminologiarbeid på et fagområde, kan
                kontakte oss for å få opprettet en termbase og brukertilgang til
                denne.
              </p>
              <p>
                Ved oppstart vil vi gi en innføring i praktisk bruk av
                redigeringsapplikasjonen. Vi kan også gi en innføring i
                terminologisk metode, noe som anbefales dersom en ikke alt har
                terminologisk kompetanse i termgruppen. Vi bistår også selvsagt
                videre i arbeidet etter behov.
              </p>
              <p>
                Kontakt oss gjerne på
                <AppLinkText to="mailto:termportalen@uib.no"
                  >termportalen@uib.no</AppLinkText
                >
                for mer informasjon.
              </p>
              <p>
                Ønsker du å komme i gang med terminologiarbeid, er det også
                nyttig å sette seg nærmere inn i terminologisk metode. Vi
                anbefaler både <i>Termlosen</i> og e-læringskurset
                <i>Begrip begrepene</i>. I tillegg har vi laget en mal for
                hvordan en kan jobbe i termgrupper.
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText
                    to="https://www.sprakradet.no/Sprakarbeid/Terminologi/nyttig-informasjon/termlosen/"
                    >Termlosen</AppLinkText
                  >
                  gir en kort innføring i begrepsanalyse og hvordan arbeide med
                  terminologi. Den gir blant annet råd om organisering og
                  praktisk gjennomføring av terminologiarbeid, begrepsanalyse,
                  hvordan en kan skrive gode definisjoner og hvordan termlister
                  kan bygges opp. <i>Termlosen</i> er skrevet av Heidi Suonuuti
                  og utgitt på norsk av Språkrådet.
                </li>
                <li>
                  <AppLinkText
                    to="https://laeringsplattformen.difi.no/kurs/971527404/begrip-begrepene-et-innforingskurs-i-terminologi-og-begrepsarbeid"
                    >Begrip begrepene!</AppLinkText
                  >
                  er et e-læringskurs i terminologi- og begrepsarbeid utviklet
                  av Språkrådet i samarbeid med Digitaliseringsdirektoratet.
                  Kurset er fritt tilgjengelig, det tar ca. 45 minutter å
                  gjennomføre, og det gir en enkel innføring i begrepsanalyse,
                  definisjonsskriving, termdanning og termvalg.
                </li>
                <li>
                  <AppLinkText
                    to="https://wiki.terminologi.no/images/2/27/Arbeidsmetode_for_universitets-_og_h%C3%B8yskolesektoren_31082023.pdf"
                  >
                    Arbeidsmetode for terminologiarbeid i universitets- og
                    høyskolesektoren
                  </AppLinkText>
                  gir et forslag til hvordan en kan jobbe med terminologi i
                  termgrupper. Metoden er spesielt rettet mot universitets- og
                  høyskolesektoren.
                </li>
              </ul>
            </div>
            <div v-else-if="locale === 'nn'" class="space-y-2">
              <p>
                Som ein del av Termportalen sin digitale infrastruktur, har me
                utvikla ein
                <AppLinkText
                  to="https://wiki.terminologi.no/index.php?title=Forside"
                  >redigeringsapplikasjon</AppLinkText
                >, som er eit verktøy for registrering av terminologiske data.
                Termgrupper i universitets- og høgskolesektoren og andre som
                ønskjer å kome i gong med terminologiarbeid på eit fagområde,
                kan kontakte oss for å få oppretta ein termbase og brukartilgang
                til denne.
              </p>
              <p>
                Før arbeidet med termbasen startar opp, vil me gje ei innføring
                i praktisk bruk av redigeringsapplikasjonen. Me kan òg gje ei
                innføring i terminologisk metode, noko som er anbefalt om ein
                ikkje allereie har terminologisk kompetanse i termgruppa. Me
                hjelper sjølvsagt også til vidare i arbeidet om det er behov.
              </p>
              <p>
                Kontakt oss gjerne på
                <AppLinkText to="mailto:termportalen@uib.no"
                  >termportalen@uib.no</AppLinkText
                >
                om du vil ha meir informasjon.
              </p>
              <p>
                Om du ønskjer å kome i gang med terminologiarbeid, er det òg
                nyttig å setje seg nærare inn i terminologisk metode. Me
                anbefaler både <i>Termlosen</i> og e-læringskurset
                <i>Begrip begrepene</i>. I tillegg har me laga ein mal for
                korleis ein kan jobbe i termgrupper.
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText
                    to="https://www.sprakradet.no/Sprakarbeid/Terminologi/nyttig-informasjon/termlosen/"
                    >Termlosen</AppLinkText
                  >
                  gir ei kort innføring i omgrepsanalyse og korleis ein arbeider
                  med terminologi. Den gir blant anna råd om organisering og
                  praktisk gjennomføring av terminologiarbeid, omgrepsanalyse,
                  korleis ein kan skrive gode definisjonar og korleis ein kan
                  bygge opp termlister. <i>Termlosen</i> er skriven av Heidi
                  Suonuuti og gitt ut på norsk av Språkrådet.
                </li>
                <li>
                  <AppLinkText
                    to="https://laeringsplattformen.difi.no/kurs/971527404/begrip-begrepene-et-innforingskurs-i-terminologi-og-begrepsarbeid"
                    >Begrip begrepene!</AppLinkText
                  >
                  er eit e-læringskurs i terminologi- og omgrepsarbeid utvikla
                  av Språkrådet i samarbeid med Digitaliseringsdirektoratet.
                  Kurset er fritt tilgjengeleg, det tar ca. 45 minutt å
                  gjennomføre, og det gir ei enkel innføring i omgrepsanalyse,
                  definisjonsskriving, termdanning og termvalg.
                </li>
                <li>
                  <AppLinkText
                    to="https://wiki.terminologi.no/images/2/27/Arbeidsmetode_for_universitets-_og_h%C3%B8yskolesektoren_31082023.pdf"
                  >
                    Arbeidsmetode for terminologiarbeid i universitets- og
                    høgskolesektoren
                  </AppLinkText>
                  gir eit forslag til korleis ein kan jobbe med terminologi i
                  termgrupper. Metoden er spesielt retta mot universitets- og
                  høgskolesektoren.
                </li>
              </ul>
            </div>
            <div v-else class="space-y-2">
              <p>
                As part of the digital infrastrucure of Termportalen we have
                developed a terminology management application, which is a tool
                for registering terminological data. If you want to establish a
                term group to work on terminology within a higher education
                subject field, or in another domain, please contact us. We will
                then set up a separate termbase for you to use.
              </p>
              <p>
                Before you start working on the termbase, we will give you an
                introduction to the terminology management application. We may
                also give an introduction to terminological methods, something
                which is recommended if the group does not already include
                members with a terminological competence. We will of course also
                offer further assistance, both on technical and methodological
                issues as needed.
              </p>
              <p>
                Please do not hesitate to contact us on
                <AppLinkText to="mailto:termportalen@uib.no"
                  >termportalen@uib.no</AppLinkText
                >
                for more information.
              </p>
              <p>
                If you want to get started on terminology work, it is also
                helpful to get more knowledge of terminological methods. We
                recommend <i>Termlosen</i> and the online course
                <i>Begrip begrepene</i>, as well as our methodology on how to
                work in term groups:
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText
                    to="http://www.nordterm.net/filer/publikationer/guider/Guide_to_Terminology.pdf"
                    >Guide to terminology</AppLinkText
                  >
                  gives a short introduction to concept analysis and how to work
                  on terminology. It gives among other things advice on how to
                  organise the work and the practicalities of terminology work,
                  concept analysis, how to write good terminological definitions
                  and how to build term lists. <i>Guide to terminology</i> is
                  written by Heidi Suonuuti and published in English by
                  NORDTERM.
                </li>
                <li>
                  <AppLinkText
                    to="https://laeringsplattformen.difi.no/kurs/971527404/begrip-begrepene-et-innforingskurs-i-terminologi-og-begrepsarbeid"
                    >Begrip begrepene!</AppLinkText
                  >
                  is an online course on terminology and concept analysis
                  developed by the Language Council of Norway and the Norwegian
                  Digitalisation Agency. The course is freely available, takes
                  about 45 minutes to complete and gives a basic introduction to
                  concept analysis, how to write terminological definitions, and
                  how to choose or coin terms [only available in Norwegian].
                </li>
                <li>
                  <AppLinkText
                    to="https://wiki.terminologi.no/images/2/27/Arbeidsmetode_for_universitets-_og_h%C3%B8yskolesektoren_31082023.pdf"
                  >
                    Arbeidsmetode for terminologiarbeid i universitets- og
                    høgskolesektoren
                  </AppLinkText>
                  presents a methodology on how to work with terminology in term
                  groups. It is particularly aimed at term groups in higher
                  education, but it may be used for other domains as well [will
                  soon be available in English].
                </li>
              </ul>
            </div>
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.links") }}</h2>
            </template>
            <div v-if="locale === 'nb'" class="space-y-2">
              <p>
                Ønsker du å komme i gang med terminologiarbeid, kan det være
                nyttig å sette seg nærmere inn i terminologisk metode.
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText
                    to="https://www.sprakradet.no/Sprakarbeid/Terminologi/nyttig-informasjon/termlosen/"
                    >Termlosen</AppLinkText
                  >
                  gir en kort innføring i begrepsanalyse og hvordan arbeide med
                  terminologi. Den gir blant annet råd om organisering og
                  praktisk gjennomføring av terminologiarbeid, begrepsanalyse,
                  hvordan en kan skrive gode definisjoner, og hvordan termlister
                  kan bygges opp. <i>Termlosen</i> er skrevet av Heidi Suonuuti
                  og utgitt på norsk av Språkrådet.
                </li>
                <li>
                  <AppLinkText
                    to="https://laeringsplattformen.difi.no/kurs/971527404/begrip-begrepene-et-innforingskurs-i-terminologi-og-begrepsarbeid"
                    >Begrip begrepene!</AppLinkText
                  >
                  er et e-læringskurs i terminologi- og begrepsarbeid utviklet
                  av Språkrådet i samarbeid med Digitaliseringsdirektoratet.
                  Kurset fritt tilgjengelig, det tar ca. 45 minutter å
                  gjennomføre, og det gir en enkel innføring i begrepsanalyse,
                  definisjonsskriving, termdanning og termvalg.
                </li>
              </ul>
              <p>
                Trenger du å sjekke grammatikk og/eller engelske ord og uttrykk,
                anbefaler vi følgende sider:
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText to="https://ordbokene.no/"
                    >Ordbøkene.no</AppLinkText
                  >: <i>Bokmålsordboka</i> og <i>Nynorskordboka</i> viser
                  skrivemåte og bøyning i tråd med norsk rettskriving.
                  Språkrådet og Universitetet i Bergen står bak ordbøkene.
                </li>
                <li>
                  <AppLinkText to="https://www.oxfordlearnersdictionaries.com/"
                    >Oxford Learner’s Dictionaries</AppLinkText
                  >: allmennordbøker for blant annet britisk, amerikansk og
                  akademisk språk.
                </li>
              </ul>
              <p>
                Språkrådet har også råd om skriveregler, praktisk grammatikk og
                skriveråd under menyen
                <AppLinkText to="https://www.sprakradet.no/sprakhjelp/"
                  >Språkhjelp</AppLinkText
                >.
              </p>
            </div>
            <div v-else-if="locale === 'nn'" class="space-y-2">
              <p>
                Om du ønskjer å kome i gang med terminologiarbeid, er det òg
                nyttig å setje seg nærare inn i terminologisk metode:
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText
                    to="https://www.sprakradet.no/Sprakarbeid/Terminologi/nyttig-informasjon/termlosen/"
                    >Termlosen</AppLinkText
                  >
                  gir ei kort innføring i omgrepsanalyse og korleis ein arbeider
                  med terminologi. Den gir blant anna råd om organisering og
                  praktisk gjennomføring av terminologiarbeid, omgrepsanalyse,
                  korleis ein kan skrive gode definisjonar og korleis ein kan
                  bygge opp termlister. <i>Termlosen</i> er skriven av Heidi
                  Suonuuti og gitt ut på norsk av Språkrådet.
                </li>
                <li>
                  <AppLinkText
                    to="https://laeringsplattformen.difi.no/kurs/971527404/begrip-begrepene-et-innforingskurs-i-terminologi-og-begrepsarbeid"
                    >Begrip begrepene!</AppLinkText
                  >
                  er eit e-læringskurs i terminologi- og omgrepsarbeid utvikla
                  av Språkrådet i samarbeid med Digitaliseringsdirektoratet.
                  Kurset er fritt tilgjengeleg, det tar ca. 45 minutt å
                  gjennomføre, og det gir ei enkel innføring i omgrepsanalyse,
                  definisjonsskriving, termdanning og termvalg.
                </li>
              </ul>
              <p>
                Om du treng å sjekke grammatikk og/eller engelske ord og
                uttrykk, anbefaler vi desse sidene:
              </p>
              <ul>
                <li>
                  <AppLinkText to="https://ordbokene.no/"
                    >Ordbøkene.no</AppLinkText
                  >: <i>Bokmålsordboka</i> og <i>Nynorskordboka</i> viser
                  skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet
                  og Universitetet i Bergen står bak ordbøkene.
                </li>
                <li>
                  <AppLinkText to="https://www.oxfordlearnersdictionaries.com/"
                    >Oxford Learner’s Dictionaries</AppLinkText
                  >: allmennordbøker for blant anna britisk, amerikansk og
                  akademisk språk.
                </li>
              </ul>
              <p>
                Språkrådet har òg råd om skrivereglar, praktisk grammatikk og
                skriveråd under menyen
                <AppLinkText to="https://www.sprakradet.no/sprakhjelp/"
                  >Språkhjelp</AppLinkText
                >.
              </p>
            </div>
            <div v-else class="space-y-2">
              <p>
                If you want to get started with terminology work, it is also
                helpful to get more knowledge of terminological methods:
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText
                    to="http://www.nordterm.net/filer/publikationer/guider/Guide_to_Terminology.pdf"
                    >Guide to terminology</AppLinkText
                  >
                  gives a short introduction to concept analysis and how to work
                  on terminology. It gives among other things advice on how to
                  organize the work and the practicalities of terminology work,
                  concept analysis, how to write good terminlogical definitions
                  and how to build term lists. <i>Guide to terminology</i> is
                  written by Heidi Suonuuti and published in English by
                  NORDTERM.
                </li>
                <li>
                  <AppLinkText
                    to="https://laeringsplattformen.difi.no/kurs/971527404/begrip-begrepene-et-innforingskurs-i-terminologi-og-begrepsarbeid"
                    >Begrip begrepene!</AppLinkText
                  >
                  is an online course on terminology and concept analysis
                  developed by the Language Council of Norway and the Norwegian
                  Digitalisation Agency. The course is freely available, takes
                  about 45 minutes to complete and gives a basic introduction to
                  concept analysis, how to write terminological definitions, and
                  how to choose or coin terms [only available in Norwegian].
                </li>
              </ul>
              <p>
                If you need to control grammar and/or English words and
                expressions, we recommend these sites:
              </p>
              <ul class="ml-[2.5em] space-y-2">
                <li>
                  <AppLinkText to="https://ordbokene.no/"
                    >Ordbøkene.no</AppLinkText
                  >: <i>Bokmålsordboka</i> and <i>Nynorskordboka</i> present
                  orthography and inflections according to the Norwegian norm.
                  The Language Council of Norway and the University of Bergen
                  are responsible for these dictionaries.
                </li>
                <li>
                  <AppLinkText to="https://www.oxfordlearnersdictionaries.com/"
                    >Oxford Learner’s Dictionaries</AppLinkText
                  >: General language dictionaries for British, American and
                  academic language and more.
                </li>
              </ul>
              <p>
                Advice on spelling, practical grammar and advice on writing is
                also found on the Language Council of Norway’s webpage
                <AppLinkText to="https://www.sprakradet.no/sprakhjelp/"
                  >Språkhjelp</AppLinkText
                >.
              </p>
            </div>
          </AccordionTab>
        </Accordion>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>

<style scoped>
blockquote {
  display: block;
  margin-left: 2.5em;
  margin-right: 0em;
}
.content-page p {
  @apply py-1.5;
}

.content-page ul {
  text-indent: -1.5em;
  padding-left: 1.5em;
  @apply list-inside;
}

.content-page ol {
  @apply list-decimal pl-[1.5em];
}
</style>
