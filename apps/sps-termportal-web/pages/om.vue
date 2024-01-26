<template>
  <div>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-3xl">
        <ContentDoc :path="`/${locale}/om/about`" class="content-page" />
        <Accordion multiple class="mt-6">
          <!-- About us-->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.aboutUs") }}</h2>
            </template>
            <ContentDoc :path="`/${locale}/om/about-us`" class="content-page" />
          </AccordionTab>
          <!-- Fagrådet -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.fagrad") }}</h2>
            </template>
            <div class="content-page">
              <ContentDoc :path="`/${locale}/om/fagrad`" />
              <ContentDoc :path="`/${locale}/om/fagrad-mandat`" />
            </div>
          </AccordionTab>
          <!-- History -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.history") }}</h2>
            </template>
            <div class="content-page">
              <ContentDoc :path="`/${locale}/om/history`" />
              <ContentDoc :path="`/${locale}/om/publications`" />
            </div>
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
