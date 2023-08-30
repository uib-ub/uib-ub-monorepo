<template>
  <main id="main" tabindex="-1" class="secondary-page">
    <h2>{{$t('about.title')}}</h2>
    <div v-if="$i18n.locale === 'eng'">
      <p>This is the new website for the two Norwegian standard dictionaries <em>Bokmålsordboka</em> and <em>Nynorskordboka</em>. The website is still under development, so some features may not yet be in place. The content of the dictionaries is undergoing revision, and the editorial staff continuously publishes new word-articles, or articles which have been revised and quality checked.</p>
      <p>Should you wish to use the old dictionary interface, you can it here: <a href="http://www.ordbok.uib.no/">ordbok.uib.no</a></p>
      <p>In connection with the website upgrade, we have cleaned up both the interface and our data. Therefore, there may be errors and omissions in the new solution that have not yet discovered, or have had time to get sorted. Should you discover an error or a wrong or defective article, we appreciate your feedback very much! Feel free to contact us via email:</p>
      <ul>
        <li>{{$t('contact.content[2]')}}<a href="mailto:ordbok@uib.no">ordbok@uib.no</a></li>
        <li>{{$t('contact.content[3]')}}<a href="mailto:ordbok-teknisk@uib.no">ordbok-teknisk@uib.no</a></li>
      </ul>
  
      <Collapsible id="missing-word" is="h3" :header="$t('about.items[0].title')">
          <p><em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are medium-sized online dictionaries. The original dictionary in Bokmål contained around 65,000 articles and the Nynorsk dictionary freatured almost 90,000. After the <a href="https://www.uib.no/lle/revisjonsprosjektet">current dictionary revision</a>, it is estimated that both dictionaries will contain around 100,000 articles. The dictionaries document the central vocabulary in Norwegian – basically the most commonly occurring words in the written languages Bokmål and Nynorsk in the last 50 years that have been included. Specialised terms and terminology are only included if also used outside the field in which they have arisen.</p>
          <p>The most common way to make new words in Norwegian is to compound existing words in new ways – and there are countless combination possibilities. Therefore, many compounds will not have their own articles in Bokmålsordboka and Nynorskordboka. Thus, if you do not find the Norwegian term for ‘bicycle seat’ (<em>sykkelsete</em>) as an entry in the dictionaries, it does not mean that the word does not exist or is not allowed to use. Compound words are generally only included based on the following considerations:</p>
          <ul>
            <li>when the compound is not immediately understandable from the knowledge of each individual compound element</li>
            <li>so that the dictionary user confer on what other compounds with the same first element mean, based on selection of compound words included</li>
            <li>to show which binding letter the composition should have (<em>skogbruk</em> (forestry), but skog<u>s</u>arbeid (forestry work); <em>sakfører</em> (lawyer), but <em>sak<u>s</u>sbehandler</em> (caseworker); <em>ost<u>e</u>klokke</em> (cheese bell), but <em>dørklokke</em> (door bell))</li>
          </ul>
          <p>Similarly, only a limited selection of derivatives (for example, verbal nouns in <em>-ing</em>) are included in the standard dictionaries. In Norwegian it is possible to form ing-forms from most verbs. Thus, you will be able to find the words <em>organisere</em> (to organise) and <em>sitere</em> (to quote, to cite) in <em>Bokmålsordboka</em> and <em>Nynorskordboka</em>, and form the derivations <em>organisering</em> (organisation) and <em>sitering</em> (quotation, citation) yourself. Note, however, that there are potential <em>ing-</em>forms that are rarely used, such as <em>komming</em> (coming) and <em>væring</em> (being).</p>
          <p>The <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are not to be regarded as lists of words permitted to use in Norwegian. There are many words – old as well as new – that are not in the dictionaries. But you can use anyway. New words do not need official approval before they can be used. It is the language users who jointly decide which words are commonly used in Norwegian. Normally, new words do not enter the dictionaries until they have been in use for some time and are well-established in the language. The dictionary editors decide which words are to be included based on surveys of large text corpora, and the Norwegian Language Council decides how the words are to be spelled and inflected.</p>
          <p><a href="https://www.sprakradet.no/Vi-og-vart/Publikasjoner/Spraaknytt/spraknytt-2014/Spraknytt-12014/Ord-som-finst-og-ikkje-finst/">Read more about the word selection</a> in e.g. <em>Bokmålsordboka</em> and <em>Nynorskordboka</em>.</p>
          <p>If you do not find the word you are looking for, you can check the larger documentation dictionaries <a href="https://alfa.norsk-ordbok.no">Norsk Ordbok (for Nynorsk and dialect words)</a> and <a href="https://naob.no/">NAOB (for Bokmål)</a>.</p>
      </Collapsible>
  
  <Collapsible id="quality" is="h3" :header="$t('about.items[1].title')">
  
            <p><em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are two independent, monolingual dictionaries for Bokmål and Nynorsk, respectively. The dictionaries are jointly owned by the Language Council and the University of Bergen.</p>
            <p><a href ="https://www.sprakradet.no/">The Norwegian Language Council</a> decides how words are spelled and inflected in Bokmål and Nynorsk. <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are continuously being updated in line with spelling decisions in the Language Council and is the right place for information on what is current and correct spelling in Bokmål and Nynorsk.</p>
            <p>Since 2016, the editorial work with the standard dictionaries <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> has been carried out at the University of Bergen, with several departments involved. <a href ="https://www.uib.no/en/ub/spesial/161345/about-norwegian-language-collections">The Norwegian Language Collections</a> manage the dictionaries and the source material on which they are based. The dictionary editors are employed at the <a href="https://www.uib.no/lle">Department of Linguistic, Literary and Aesthetic Studies (LLE)</a>, and the computer technical work takes place at the <a href="https://www.uib.no/it">IT department</a> and the Norwegian Language Collections at the University Library. The content of the dictionaries is quality assured by the Language Council.</p>
  
  
  </Collapsible>
  
  <Collapsible id="cite" is="h3" :header="$t('about.items[2].title')">
    <p>The contents of <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are protected by copyright, cf. the Norwegian copyright act: Lov om opphavsrett til åndsverk. Should you wish to quote an article in Bokmålsordboka or Nynorskordboka, we recommend stating when the article was retrieved (read) when quoting, such as e.g.:</p>
    <p>"Hvordan". In: <em>Bokmålsordboka</em>. The Norwegian Language Council and the University of Bergen. &lt;http: //ordbøkene.no&gt; (retrieved 25.1.2022).</p>
    <p>Both owners of the dictionary, the Norwegian Language Council and the University of Bergen, must be mentioned in the reference</p>
  
  
  </Collapsible>
  
  <Collapsible id="smartphone" is="h3" :header="$t('about.items[3].title')">
    <p>The website, ordbøkene.no, has a responsive design. This means that the dictionary content adapts to screens of all sizes. If you wish to have a shortcut to Bokmålsordboka and Nynorskordboka on your smartphone, search for ordbøkene.no in the browser and place it as an icon on the screen. The icon looks like an app, and you can click right into the website without opening your browser.</p>
            <h4>For iPhone / iOS</h4>
            <ul>
              <li>Open your browser and type ordbokene.no or ordbøkene.no.</li>
              <li>From the front page, select the share icon <Icon name="bi:box-arrow-up"/> at the bottom of the page.</li>
              <li>From the double row of sub-options, select the icon "Add to Home Screen" <Icon name="bi:plus-square-fill" />. You may need to drag the row from the right to get to the icon.</li>
            </ul>
            <p>The dictionaries icon <img class="ordbokene-icon" src="/favicon.ico" aria-hidden="true"/> is now on your home screen, and you can access the dictionary page directly by clicking on it.</p>
            <h4>For Android</h4>
            <ul>
              <li>Open the browser and type ordbokene.no or ordbøkene.no.</li>
              <li>From the front page, select the icon with the three vertical dots in the upper right corner: <Icon name="bi:three-dots-vertical" /></li>
              <li>A list of options appears. Select "Add to home page", a little down the list.</li>
              <li>A new window appears asking you to add ordbøkene.no to your home screen. Click "Add".</li>
            </ul>
            <p>The dictionaries icon is now on your home screen, and you can access the dictionary page directly by clicking on it.NB! On some models from Samsung, the option "Add page in" is found in a menu at the bottom of the page. From there, select the home screen.</p>
  </Collapsible>
  
  <Collapsible id="open-data" is="h3" :header="$t('about.items[4].title')">
        <p>The contents of <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are openly available for download, and can be used for any purpose, including commercial, in accordance with the conditions given. <a href="https://www.uib.no/ub/fagressurser/spesialsamlingene/142334/lisens-bokm%C3%A5lsordboka-og-nynorskordboka">Read more about the open license here</a>.</p>
        <p>Inflection information in Bokmålsordboka and Nynorskordboka is sourced from Norsk ordbank (Norwegian Word Database). Ordbanken is a lexical database for Bokmål and Nynorsk providing information on word class and standard inflection for far more words than those found in the standard dictionaries. Norsk ordbank is available for download at Språkbanken at the National Library under a CC-BY license.</p>
  
  </Collapsible>
  
  <Collapsible id="history" is="h3" :header="$t('about.items[5].title')">
            <p>The standard dictionaries <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> were first published in 1986 as a collaborative project between the University of Oslo and the Norwegian Language Council and have since been issued in several editions. In printed form, <em>Bokmålsordboka</em> and <em>Nynorskordboka</em> are large single-volume dictionaries. Spelling and inflection are always in line with current standards. Furthermore, the dictionaries state meanings, examples of usage and give short etymologies. </p>
            <p><a href="https://www.uib.no/sites/w3.uib.no/files/attachments/om_ordbokene.pdf">Here you will find the preface to the printed editions (in Norwegian)</a> and more information about previous dictionary editors and the earlier work carried out at the University of Oslo. </p>
            <p>The University of Bergen and the Language Council will no longer be issuing printed editions of the standard dictionaries. </p>
  
  
  </Collapsible>
  
  <Collapsible id="revision" is="h3" :header="$t('about.items[6].title')">
            <p>The Bokmålsordboka and Nynorskordboka are currently undergoing an extensive content update. During the period 2018–2023, an editorial group is revising both dictionaries from a to å. The most important tasks are to bring in new words and update meanings, and make sure that the content is in line with current language use. Making the selection of words more similar in the two dictionaries is also a priority. More information can be found on the Dictionary Revision Project’s website (in Norwegian). </p>
            <p>Current editorial staff of <em>Bokmålsordboka</em> and <em>Nynorskordboka</em>:</p>
            <ul class="no-bullet">
              <li>Anne Engø, editor 2018–2023</li>
              <li>Marita Kristiansen, editor 2020–2021</li>
              <li>Gunn Inger Lyse, editor 2018–2023</li>
              <li>Mikkel Ekeland Paulsen, PhD candidate 2019–2023</li>
              <li>Margunn Rauset, project manager 2018–2023</li>
              <li>Bente Selback, editor 2018–2023</li>
              <li>Kari-Anne Selvik, editor 2018–2023</li>
              <li>Klara Sjo, editor 2020–2023</li>
              <li>Marie Lund Stokka, editor 2020</li>
              <li>Terje Svardal, editor at the Norwegian Language Collections</li>
            </ul>
            <p>Quality controllers in the Language Council:</p>
            <ul class="no-bullet">
              <li>Sturla Berg-Olsen, senior adviser</li>
              <li>Knut E. Karlsen, senior adviser</li>
              <li>Dagfinn Rødningen, senior adviser</li>
              <li>Ålov Runde, senior adviser</li>
            </ul>
            <p>IT Developers at the University of Bergen</p>
            <ul class="no-bullet">
              <li>Henrik Askjer, head engineer, Norwegian Language Collections</li>
              <li>Eirik T. Gullaksen, head engineer, IT department</li>
              <li>Paul Meurer, senior engineer, Norwegian Language Collections</li>
              <li>Silje Scholl, staff engineer, IT department 2022</li>
              <li>Nils Øverås, head engineer, IT department</li>
              <li>Ole Voldsæter, head engineer, IT department 2019–2021</li>
            </ul>
            <p><a href="https://www.netlife.com/">Netlife</a> has conducted user surveys and prepared design sketches for ordbøkene.no.</p>  
  </Collapsible>
  
  <Collapsible id="links" is="h3" :header="$t('about.items[7].title')">
  
    <p>Should you have questions about clear, good and correct Norwegian language use, please contact the <a href="mailto:sporsmal@sprakradet.no">Language Council's response service.</a></p>
    <h4>Online language resources</h4>
    <p>The Norwegian Language Collections at the University of Bergen Library have a number of language resources, including:</p>
    <ul>
      <li><a href="https://ord.uib.no/">ord.uib.no:</a> word lists and API-description for Ordbøkene.no (Norwegian. <a href="https://ordbokene.no/api/swagger-ui.html">Interactive documentation in english</a>).</li>
      <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=72&tabid=1106">Norsk ordbank, bokmål</a>: Search full declension form lists for Norwegian Bokmål </li>
      <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=73&tabid=1116">Norsk ordbank, nynorsk</a>: Search full declension form lists for Norwegian Nynorsk </li>
      <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=7&tabid=571">Metaordboka</a>: A documentation database of all registered words sorted by standard Nynorsk headwords </li>
      <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=118&tabid=1777">Ordbokhotellet</a>: An electronic index of word forms from a number of dictionaries and local dialect collections sorted under their standardised headword </li>
    </ul>
    <p><a href="http://www.sprakradet.no/">The Language Council</a> has several language resources under the menu “Language Help”, go to <a href="http://www.sprakradet.no/sprakhjelp/Skriveregler/">spelling rules</a>, <a href="http://www.sprakradet.no/sprakhjelp/Praktisk-grammatikk/">practical grammar</a> or <a href="http://www.sprakradet.no/sprakhjelp/Skriverad/">writing advice</a>.</p>
    <p>Norsk ordbank (Norwegian Word Database) is also available for download at <a href="https://www.nb.no/sprakbanken/ressurskatalog/?_search=ordbank">Språkbanken at the National Library</a> under a CC-BY license. The dictionary contains word lists for Bokmål and Nynorsk with information on word class and standard inflection.</p>
    <h4>Other quality-assured and freely available dictionaries</h4>
    <ul>
      <li><a href="https://alfa.norsk-ordbok.no">Norsk Ordbok</a>: The dictionary of the Norwegian vernacular and written Nynorsk  </li>
      <li><a href="https://naob.no/">NAOB</a>: The Norwegian Academy's Dictionary: Bokmål and Riksmål from the early 1800s until today </li>
      <li><a href="http://lexin.udir.no/">LEXIN</a>: dictionaries for minority language students in primary, secondary and adult education </li>
      <li><a href="http://www.islex.no/">Islex</a>: A dictionary in Icelandic-Norwegian (Bokmål and Nynorsk), Icelandic-Swedish, Icelandic-Danish, Icelandic-Faroese and Icelandic-Finnish  </li>
      <li><a href="http://ordnet.dk/">ordnet.dk</a>: A joint website for several Danish dictionaries and word corpora </li>
      <li><a href="https://svenska.se/">svenska.se</a>: A joint website for several Swedish dictionaries </li>
    </ul>
  
  
  </Collapsible>
  
  <Collapsible id="privacy" is="h3" :header="$t('about.items[8].title')">
    <p>Ordbøkene.no does not use cookies, but saves user preferences using local storage in the browser, without sending this information to our server at UiB. Searches are logged on the server, but we do not use this information for other purposes than search statistics. 
              We use a Nginx-webserver that continuously overwrites the logs, so that we never store IP-addresses permanently. We also log the usage of certain features on the website using plausible.io, a service that does not store IP-addresses or other information that can connect the usage statistics to individual users.</p>
  
  </Collapsible>
  
  
  
  
  
    </div>
    
    <div v-if="$i18n.locale === 'nno'">
      <p>Dette er den nye nettsida til standardordbøkene <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>. Sida er
        framleis under utvikling, så det er visse
        funksjonar som ikkje er heilt på plass enno. Arbeidet med å revidere
        innhaldet i ordbøkene er på gang, og redaksjonen legg fortløpande ut
        ordartiklar som er reviderte og kvalitetssjekka.
      </p>
      <p>Dersom du vil søkje i ordbøkene med det gamle grensesnittet, finn du dei framleis her: <a href="http://www.ordbok.uib.no/">ordbok.uib.no</a>.</p>
      <p>I samband med oppgraderinga har vi rydda både i grensesnittet og dataa
        våre. Derfor kan det vere feil og manglar i den nye løysinga som vi ikkje
        har oppdaga enno, eller ikkje har hatt tid til å få på plass. Dersom du
        oppdagar noko som er feil eller mangelfullt, vil vi gjerne ha
        tilbakemelding om det! Kontakt oss gjerne på e-post:</p>
      <ul>
        <li>{{$t('contact.content[2]')}}<a href="mailto:ordbok@uib.no">ordbok@uib.no</a></li>
        <li>{{$t('contact.content[3]')}}<a href="mailto:ordbok-teknisk@uib.no">ordbok-teknisk@uib.no</a></li>
      </ul>
  
  <Collapsible id="missing-word" is="h3" :header="$t('about.items[0].title')">
  
            <p>
              <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er mellomstore nettordbøker.<em>Bokmålsordboka</em> har hatt rundt 65&nbsp;000 oppslagsord og <em>Nynorskordboka</em> rundt 90&nbsp;000, men etter
              <a href="https://www.uib.no/lle/revisjonsprosjektet">den revisjonen som er på gang</a>, reknar vi med at begge skal innehalde rundt 100 000
              oppslagsord. Ordbøkene skal gjere greie for det sentrale ordtilfanget, og det er i utgangspunktet dei vanlegaste orda i skriftspråka bokmål og
              nynorsk dei siste 50 åra som er tekne med. Faguttrykk er berre tekne med i den grad dei òg er i bruk utanfor fagfeltet dei oppstod i.
            </p>
            <p>
              Den vanlegaste måten vi lagar nye norske ord på, er å setje saman gamle ord på nye måtar, og det er tallause måtar å kombinere dei på. Derfor er det
              mange samansetningar som ikkje har eigne artiklar i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>. Sjølv om du ikkje finn<em> sykkelsete</em> som
              oppslagsord her, tyder ikkje det at ordet ikkje finst eller ikkje er lov å skrive. Samansette ord er særleg tekne med ut frå tre omsyn:
            </p>
            <ul>
              <li>når dei ikkje utan vidare er forståelege ut frå kjennskap til dei enkelte ledda</li>
              <li>for at ordbokbrukaren på grunnlag av dei samansetningane som er tekne med, kan slutte seg til kva andre samansetningar med same forledd tyder</li>
              <li>for å vise kva bindebokstav samansetninga skal ha, om nokon (<em>skogbruk</em>, men <em>skog<u>s</u>arbeid</em>; <em>sakførar</em>, men <em>sak<u>s</u>behandlar</em>;<em> ost<u>e</u>klokke</em>, men<em> dørklokke</em>)</li>
            </ul>
            <p>
              Tilsvarande er berre eit avgrensa utval av avleiingar (for eksempel verbalsubstantiv på -<em>ing</em>) tekne med i standardordbøkene. På norsk
              kan vi danne<em> ing</em>-former av dei aller fleste verb, så finn du oppslagsorda <em>organisere</em> og <em>sitere</em> i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>, kan du
              sjølv lage avleiingane <em>organisering</em> og <em>sitering</em>. Merk likevel at det finst potensielle <em>ing</em>-former som sjeldan blir brukte, til dømes <em>koming</em> og <em>vering</em>.
            </p>
            <p>
              <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er ikkje å rekne som lister over kva ord som er tillatne å bruke på norsk. Det finst mange ord, både gamle og nye, som
              ikkje er med i ordbøkene, men som du gjerne kan bruke likevel. Det er heller ikkje slik at nye ord må godkjennast før dei kan takast i bruk, det
              er språkbrukarane som i fellesskap avgjer kva ord som er gangbare i norsk. Normalt kjem ikkje nye ord inn i ordbøkene før dei har vore i bruk ei stund
              og er etablerte i språket. Ordbokredaksjonen avgjer kva ord som skal vere med basert på undersøkingar av store tekstsamlingar, og Språkrådet avgjer korleis orda skal stavast og bøyast.
            </p>
            <p><a href="https://www.sprakradet.no/Vi-og-vart/Publikasjoner/Spraaknytt/spraknytt-2014/Spraknytt-12014/Ord-som-finst-og-ikkje-finst/">Her kan du lese meir om ordutvalet</a> mellom anna i <em>Bokmålsordboka </em>og <em>Nynorskordboka</em>.</p>
            <p>Dersom du ikkje finn ordet du leitar etter, kan du sjekke dei større og dokumenterande ordbøkene <a href="https://alfa.norsk-ordbok.no"><em>Norsk Ordbok</em></a> (for dialektord og nynorsk) og <a href="https://naob.no/">NAOB</a> (for bokmål).</p>  
  
  </Collapsible>
  
  <Collapsible id="quality" is="h3" :header="$t('about.items[1].title')">
            <p><em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er to sjølvstendige, einspråklege ordbøker. Språkrådet og Universitetet i Bergen (UiB) eig ordbøkene i fellesskap.</p>
            <p><a href="https://www.sprakradet.no/">Språkrådet</a> avgjer korleis ord skal skrivast og bøyast på bokmål og nynorsk. <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>blir løpande oppdaterte i tråd med rettskrivingsvedtak i Språkrådet, så det er her du finn fasiten på kva som er gjeldande og fullstendig rettskriving i bokmål og nynorsk.</p>
            <p>
              Sidan 2016 har det redaksjonelle arbeidet med standardordbøkene blitt utført ved Universitetet i Bergen, der fleire avdelingar er involverte.
              <a href="https://www.uib.no/en/ub/spesial/161345/about-norwegian-language-collections">Språksamlingane</a> forvaltar ordbøkene og kjeldegrunnlaget dei byggjer på, ordbokredaktørane
              er tilsette ved <a href="https://www.uib.no/lle">Institutt for lingvistiske, litterære og estetiske studium</a>, og det datatekniske arbeidet går føre seg ved 
              <a href="https://www.uib.no/it">IT-avdelinga</a>. Innhaldet i ordbøkene er kvalitetssikra av Språkrådet.
            </p>
  </Collapsible>
  
  <Collapsible id="cite" is="h3" :header="$t('about.items[2].title')">
            <p>Innhaldet i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er verna av opphavsrett, jf. <a href="https://lovdata.no/dokument/NL/lov/2018-06-15-40">lov om opphavsrett til åndsverk</a>mv.</p>
            <p>Ønskjer du å sitere ein artikkel i <em>Bokmålsordboka</em> eller <em>Nynorskordboka</em>, rår vi deg til å gje opp når artikkelen vart henta (lesen), t.d. slik:</p>
            <p>«Korleis». I: <em>Nynorskordboka</em>. Språkrådet og Universitetet i Bergen. &lt;<a href="http://ordbokene.no/">http://ordbøkene.no</a> &gt; (henta 25.1.2022).</p>
            <p>Begge eigarane av ordboka, Språkrådet og Universitetet i Bergen, bør nemnast i referansen.</p> 
  </Collapsible>
  
  <Collapsible id="smartphone" is="h3" :header="$t('about.items[3].title')">
  
            <p>Nettsida ordbøkene.no har responsivt design, som gjer at innhaldet tilpassar seg både store og små skjermar. Ynskjer du å ha lenkja til Bokmålsordboka og Nynorskordboka på mobilskjermen din, søkjer du opp ordbøkene.no i nettlesaren og legg henne ut som ikon på skjermen. Ikonet ut som ein app, og du kan trykkje deg rett inn på nettsida, utan å gå vegen om nettlesaren.</p>
            <h4>For iPhone/iOs</h4>
            <ul>
              <li>Opne nettlesaren og skriv inn enten ordbokene.no eller ordbøkene.no.</li>
              <li>Når du er inne på forsida, vel du ikonet nedst på sida for å dele:  <Icon name="bi:box-arrow-up"/>.</li>
              <li>Det kjem opp delealternativ i to rader. I den nedste rada vel du «Legg til på Heim-skjerm» med ikonet <Icon name="bi:plus-square-fill" /> Det kan hende du må drage rada frå høgre for å kome til ikonet.</li>
            </ul>
            <p>Ordbøkene-ikonet <img class="ordbokene-icon" src="/favicon.ico"  aria-hidden="true"/> ligg no på heim-skjermen din, og du kjem direkte inn på ordboksida ved å klikke på det.</p>
            <h4>For Android</h4>
            <ul>
              <li>Opne nettlesaren og skriv inn enten ordbokene.no eller ordbøkene.no.</li>
              <li>Når du er inne på forsida, vel du ikonet med dei tre loddrette prikkane i øvre høgre hjørnet:  <Icon name="bi:three-dots-vertical" />.</li>
              <li>Det kjem då fram ei liste med valalternativ, og du vel «Legg til på startsida», eit stykke nede på lista.</li>
              <li>Det dukkar opp eit vindauge som føreslår at du legg til Ordbøkene på startsida. Klikk på valet «Legg til».</li>
            </ul>
            <p>Ordbøkene-ikonet <img class="ordbokene-icon" src="/favicon.ico" aria-hidden="true"/> ligg no på startsida di, og du kjem direkte inn på ordboksida ved å klikke på det. NB! I somme modellar frå Samsung ligg valet «Legg til side i» i ein meny nedst på sida. Derfrå vel du startsida.</p>
  
  </Collapsible>
  
  <Collapsible id="open-data" is="h3" :header="$t('about.items[4].title')">
  
            <p><em>Innhaldet i Bokmålsordboka</em> og <em>Nynorskordboka</em> ligg ope tilgjengeleg for nedlasting. Det kan
              brukast til kva formål som helst, inkludert kommersielle, i samsvar med gjevne vilkår.
              <a href="https://www.uib.no/ub/fagressurser/spesialsamlingene/142334/lisens-bokm%C3%A5lsordboka-og-nynorskordboka">Les meir om den opne lisensen her.</a>
            </p>
            <p>
              Informasjonen i bøyingstabellane i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er henta frå Norsk ordbank. Ordbanken er ein
              leksikalsk database for bokmål og nynorsk med informasjon om ordklasse og normert bøying for langt fleire ord enn dei som er oppslagsord i
              standardordbøkene. Norsk ordbank ligg <a href="https://www.nb.no/sprakbanken/ressurskatalog/?_search=ordbank">tilgjengeleg for nedlasting hos Språkbanken</a>
              ved Nasjonalbiblioteket under lisensen CC-BY.
            </p>
  
  </Collapsible>
  
  <Collapsible id="history" is="h3" :header="$t('about.items[5].title')">
  
            <p>
              <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> vart først gjevne ut i 1986, produsert gjennom eit samarbeidsprosjekt mellom Universitetet i Oslo og Norsk språkråd, og
              seinare har dei kome i fleire utgåver. I trykt form er <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> store eittbinds ordbøker. Dei viser skrivemåtar og bøying som alltid er i tråd med dei
              gjeldande normene. Vidare gjev ordbøkene opp tydingar, bruksdøme og korte etymologiar.
            </p>
            <p><a href="https://www.uib.no/sites/w3.uib.no/files/attachments/om_ordbokene_0.pdf">Her finner du fororda til dei trykte utgåvene</a> og meir informasjon om tidlegare ordbokredaktørar og arbeidet med ordbøkene ved Universitetet i Oslo.</p>
            <p>Universitetet i Bergen og Språkrådet kjem ikkje til å publisere fleire trykte utgåver av standardordbøkene.</p>  
  
  </Collapsible>
  
  <Collapsible id="revision" is="h3" :header="$t('about.items[6].title')">
            <p>
              Det går for tida føre seg eit omfattande arbeid med å oppdatere innhaldet i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>. I perioden 2018–2023
              går ei gruppe redaktørar gjennom begge ordbøkene frå a til å. Dei viktigaste oppgåvene er å få inn nye ord og tydingar, passe på at innhaldet
              er i tråd med språkbruken i dag, og gjere utvalet av ord likare i dei to ordbøkene. Meir informasjon finner du på
              <a href="https://www.uib.no/lle/revisjonsprosjektet">nettsida til Revisjonsprosjektet</a>.
            </p>
            <p>Noverande redaksjon for <em>Bokmålsordboka </em>og <em>Nynorskordboka</em>:</p>
            <ul class="no-bullet">
              <li>Anne Engø, redaktør 2018–2023</li>
              <li>Marita Kristiansen, redaktør 2020–2021</li>
              <li>Gunn Inger Lyse, redaktør 2018–2023</li>
              <li>Mikkel Ekeland Paulsen, stipendiat 2019–2023</li>
              <li>Margunn Rauset, prosjektleiar 2018–2023</li>
              <li>Bente Selback, redaktør 2018–2023</li>
              <li>Kari-Anne Selvik, redaktør 2018–2023</li>
              <li>Klara Sjo, redaktør 2020–2022</li>
              <li>Marie Lund Stokka, redaktør 2020</li>
              <li>Terje Svardal, redaktør ved Språksamlingane</li>
            </ul>
            <p>Kvalitetskontrollørar i Språkrådet:</p>
            <ul class="no-bullet">
              <li>Sturla Berg-Olsen, seniorrådgjevar</li>
              <li>Knut E. Karlsen, seniorrådgjevar</li>
              <li>Ålov Runde, seniorrådgjevar</li>
              <li>Dagfinn Rødningen, seniorrådgjevar</li>
            </ul>
            <p>Denne sida har blitt utforma av utviklarar på IT-avdelinga ved Universitetet i Bergen og Språksamlingane:</p>
            <ul class="no-bullet">
              <li>Henrik Askjer, overingeniør, Språksamlingane</li>
              <li>Eirik T. Gullaksen, overingeniør, IT-avdelinga</li>
              <li>Paul Meurer, senioringeniør, Språksamlingane</lI>
               <li>Silje Scholl, avdelingsingeniør, IT-avdelinga 2022</li>
              <li>Nils Øverås, overingeniør, IT-avdelinga</li>
              <li>Ole Voldsæter, overingeniør, IT-avdelinga 2019–2021</li>
            </ul>
            <p><a href="https://www.netlife.com/">Netlife</a> har gjennomført brukerundersøkingar og utarbeidd designskisser til ordbøkene.no.</p>
  </Collapsible>
  
  <Collapsible id="grammar" is="h3" :header="$t('about.items[7].title')">
            <p>Kodane nedanfor viser dei regelrette bøyingane for substantiv, adjektiv og verb. Ord med ufullstendige eller uregelrette bøyingar i desse ordklassane har bøyingskodar utan tal. Dei er merkte f. (femininum, hokjønn), m. (maskulinum, hankjønn), n. (nøytrum, inkjekjønn), subst. (substantiv), adj. (adjektiv) eller v. (verb).</p>
            <h4>Substantiv (Nynorskordboka)</h4>
            <table class="table table-bordered">
              <tr>
                <th>Kode</th>
                <th>Ubunden form eintal</th>
                <th>Bunden form eintal</th>
                <th>Ubunden form fleirtal</th>
                <th>Bunden form fleirtal</th>
              </tr>
              <tr>
                <td>f1</td>
                <td> bygd</td>
                <td> bygda</td>
                <td> bygder</td>
                <td> bygdene</td>
              </tr>
              <tr>
                <td>f2</td>
                <td> vise</td>
                <td> visa</td>
                <td> viser</td>
                <td> visene</td>
              </tr>
              <tr>
                <td>f3</td>
                <td> dronning</td>
                <td> dronninga</td>
                <td> dronningar</td>
                <td> dronningane</td>
              </tr>
              <tr>
                <td rowspan="3">m1</td>
                <td> båt</td>
                <td> båten</td>
                <td> båtar</td>
                <td> båtane</td>
              </tr>
              <tr>
                <td>hage</td>
                <td>hagen</td>
                <td>hagar</td>
                <td>hagane</td>
              </tr>
              <tr>
                <td> lærar</td>
                <td> læraren</td>
                <td> lærarar</td>
                <td> lærarane</td>
              </tr>
              <tr>
                <td rowspan="2">n1</td>
                <td> hus</td>
                <td> huset</td>
                <td> hus</td>
                <td> husa</td>
              </tr>
              <tr>
                <td> rike</td>
                <td> riket</td>
                <td> rike</td>
                <td> rika</td>
              </tr>
            </table>
            <h4>Adjektiv (Nynorskordboka)</h4>
            <table class="table table-bordered">
              <tr>
                <th>Kode</th>
                <th>Hankjønn og hokjønn</th>
                <th>Inkjekjønn</th>
                <th>Bunden form</th>
                <th>Fleirtal</th>
              </tr>
              <tr>
                <td>a1</td>
                <td> sterk</td>
                <td> sterkt</td>
                <td> sterke</td>
                <td> sterke</td>
              </tr>
              <tr>
                <td>a2</td>
                <td> norsk</td>
                <td> norsk</td>
                <td> norske</td>
                <td> norske</td>
              </tr>
              <tr>
                <td>a3</td>
                <td> grepa</td>
                <td> grepa</td>
                <td> grepa</td>
                <td> grepa</td>
              </tr>
              <tr>
                <td>a4</td>
                <td> open</td>
                <td> ope el. opent</td>
                <td> opne</td>
                <td> opne</td>
              </tr>
              <tr>
                <td>a5</td>
                <td> vaksen</td>
                <td> vakse</td>
                <td> vaksne</td>
                <td> vaksne</td>
              </tr>
            </table>
            <h4>Verb (Nynorskordboka)</h4>
            <table class="table table-bordered">
              <tr>
                <th>Kode</th>
                <th>Infinitiv</th>
                <th>Presens (Notid)</th>
                <th>Preteritum (Fortid)</th>
                <th>Perfektum partisipp (Supinum)</th>
              </tr>
              <tr>
                <td rowspan="2">v1</td>
                <td> kasta el. kaste</td>
                <td> kastar</td>
                <td> kasta</td>
                <td> kasta</td>
              </tr>
              <tr>
                <td> ropa el. rope</td>
                <td> ropar</td>
                <td> ropa</td>
                <td> ropa</td>
              </tr>
              <tr>
                <td rowspan="2">v2</td>
                <td> kvila el. kvile</td>
                <td> kviler</td>
                <td> kvilte</td>
                <td> kvilt</td>
              </tr>
              <tr>
                <td>ropa el. rope</td>
                <td> roper</td>
                <td> ropte</td>
                <td> ropt</td>
              </tr>
              <tr>
                <td>v3</td>
                <td> ropa el. rope</td>
                <td> ropar</td>
                <td> ropte</td>
                <td> ropt</td>
              </tr>
            </table>
            <h4>Substantiv (Bokmålsordboka)</h4>
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Kode</th>
                  <th>Ubestemt form entall</th>
                  <th>Bestemt form entall</th>
                  <th>Ubestemt form flertall</th>
                  <th>Bestemt form flertall</th>
                </tr>
                <tr>
                  <td rowspan="2">f1</td>
                  <td>bru</td>
                  <td>brua</td>
                  <td>bruer</td>
                  <td>bruene</td>
                </tr>
                <tr>
                  <td>pumpe</td>
                  <td>pumpa</td>
                  <td>pumper</td>
                  <td>pumpene</td>
                </tr>
                <tr>
                  <td rowspan="3">m1</td>
                  <td>stol</td>
                  <td>stolen</td>
                  <td>stoler</td>
                  <td>stolene</td>
                </tr>
                <tr>
                  <td>bakke</td>
                  <td>bakken</td>
                  <td>bakker</td>
                  <td>bakkene</td>
                </tr>
                <tr>
                  <td>pumpe</td>
                  <td>pumpen</td>
                  <td>pumper</td>
                  <td>pumpene</td>
                </tr>
                <tr>
                  <td rowspan="2">m2</td>
                  <td>lærer</td>
                  <td>læreren</td>
                  <td>lærere</td>
                  <td>lærerne</td>
                </tr>
                <tr>
                  <td>dommer</td>
                  <td>dommeren</td>
                  <td>dommere</td>
                  <td>dommerne</td>
                </tr>
                <tr>
                  <td rowspan="2">m3</td>
                  <td>bever</td>
                  <td>beveren</td>
                  <td>bevere, bevrer el. bevre</td>
                  <td>beverne el. bevrene</td>
                </tr>
                <tr>
                  <td>sommer</td>
                  <td>sommeren</td>
                  <td>sommere, somrer el. somre</td>
                  <td>sommerne el. somrene</td>
               </tr>
                <tr>
                  <td>n1</td>
                  <td>slott</td>
                  <td>slottet</td>
                  <td>slott</td>
                  <td>slotta el. slottene</td>
                </tr>
                <tr>
                  <td rowspan="2">n2</td>
                  <td>salt</td>
                  <td>saltet</td>
                  <td>salter</td>
                  <td>salta el. saltene</td>
                </tr>
                <tr>
                  <td>eple</td>
                  <td>eplet</td>
                  <td>epler</td>
                  <td>epla el. eplene</td>
                </tr>
                <tr>
                  <td rowspan="2">n3</td>
                  <td>kontor</td>
                  <td>kontoret</td>
                  <td>kontor el. kontorer</td>
                  <td>kontora el. kontorene</td>
                </tr>
                <tr>
                  <td>høve</td>
                  <td>høvet</td>
                  <td>høve el. høver</td>
                  <td>høva el. høvene</td>
                </tr>
              </tbody>
            </table>
            <h4>Adjektiv (Bokmålsordboka)</h4>
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Kode</th>
                  <th>Hankjønn og hunkjønn</th>
                  <th>Intetkjønn</th>
                  <th>Bestemt form</th>
                  <th>Flertall</th>
                </tr>
                <tr>
                  <td>a1</td>
                  <td>god</td>
                  <td>godt</td>
                  <td>gode</td>
                  <td>gode</td>
                </tr>
                <tr>
                  <td>a2</td>
                  <td>norsk</td>
                  <td>norsk</td>
                  <td>norske</td>
                  <td>norske</td>
                </tr>
                <tr>
                  <td rowspan="2">a3</td>
                  <td>ekte</td>
                  <td>ekte</td>
                  <td>ekte</td>
                  <td>ekte</td>
                </tr>
                <tr>
                  <td>oppskjørta</td>
                  <td>oppskjørta</td>
                  <td>oppskjørta</td>
                  <td>oppskjørta</td>
                </tr>
                <tr>
                  <td>a4</td>
                  <td>oppskjørtet</td>
                  <td>oppskjørtet</td>
                  <td>oppskjørtede el. oppskjørtete</td>
                  <td>oppskjørtede el. oppskjørtete</td>
                </tr>
                <tr>
                  <td rowspan="2">a5</td>
                  <td>makaber</td>
                  <td>makabert</td>
                  <td>makabre</td>
                  <td>makabre</td>
                </tr>
                <tr>
                  <td>lunken</td>
                  <td>lunkent</td>
                  <td>lunkne</td>
                  <td>lunkne</td>
                </tr>
              </tbody>
            </table>
            <h4>Verb (Bokmålsordboka)</h4>
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Kode</th>
                  <th>Infinitiv</th>
                  <th>Presens (Nåtid)</th>
                  <th>Preteritum (Fortid)</th>
                  <th>Perfektum partisipp (Supinum)</th>
                </tr>
                <tr>
                  <td rowspan="2">v1</td>
                  <td>kaste</td>
                  <td>kaster</td>
                  <td>kasta el. kastet</td>
                  <td>kasta el. kastet</td>
                </tr>
                <tr>
                  <td>bie</td>
                  <td>bier</td>
                  <td>bia el. biet</td>
                  <td>bia el. biet</td>
                </tr>
                <tr>
                  <td rowspan="2">v2</td>
                  <td>lyse</td>
                  <td>lyser</td>
                  <td>lyste</td>
                  <td>lyst</td>
                </tr>
                <tr>
                  <td>lesse</td>
                  <td>lesser</td>
                  <td>lesste</td>
                  <td>lesst</td>
                </tr>
                <tr>
                  <td>v3</td>
                  <td>leve</td>
                  <td>lever</td>
                  <td>levde</td>
                  <td>levd</td>
                </tr>
                <tr>
                  <td rowspan="2">v4</td>
                  <td>nå</td>
                  <td>når</td>
                  <td>nådde</td>
                  <td>nådd</td>
                </tr>
                <tr>
                  <td>bie</td>
                  <td>bier</td>
                  <td>bidde</td>
                  <td>bidd</td>
                </tr>
              </tbody>
            </table>
  </Collapsible>
  
  <Collapsible id="link" is="h3" :header="$t('about.items[8].title')">
      <p>
        Har du spørsmål om klar, god og korrekt språkbruk, kan du ta kontakt med <a href="mailto:sporsmal@sprakradet.no">svartenesta</a> til Språkrådet.
        Språkrådet har mange språkressursar samla under menyen Språkhjelp: Gå til <a href="https://www.sprakradet.no/sprakhjelp/Skriveregler/">skriveregler</a>,
        <a href="https://www.sprakradet.no/sprakhjelp/Praktisk-grammatikk/">praktisk grammatikk</a> eller <a href="https://www.sprakradet.no/sprakhjelp/Skriverad/">skriveråd</a>.
      </p>
      <p>Språksamlingane ved Universitetsbiblioteket i Bergen har ei rekkje språkressursar, mellom andre:</p>
      <ul>
        <li><a href="https://ord.uib.no/">ord.uib.no:</a> ordlister og API-beskriving for Ordbøkene (<a href="https://ordbokene.no/api/swagger-ui.html">interaktiv dokumentasjon</a>).</li>
        <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=72&amp;tabid=1106">Norsk ordbank, bokmål</a> : søk i fullformslister for bokmål</li>
        <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=73&amp;tabid=1116">Norsk ordbank, nynorsk</a> : søk i fullformslister for nynorsk</li>
        <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=7&amp;tabid=571">Metaordboka</a> : felles database over alle dokumenterte ord sortert på normert nynorsk oppslagsord</li>
        <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=118&amp;tabid=1777">Ordbokhotellet</a> : elektronisk indeks over ordformer frå ei rekkje lokale ordsamlingar sortert under normert oppslagsform</li>
        <li><a href="http://inger.uib.no/perl/search/search.cgi">Alle digitale språkressursar under Språksamlingane</a></li>
      </ul>
      <h4>Andre kvalitetssikra og fritt tilgjengelege ordbøker:</h4>
      <ul>
        <li><a href="https://alfa.norsk-ordbok.no">Norsk Ordbok</a> : Ordboka over det norske folkemålet og det nynorske skriftmålet</li>
        <li><a href="http://www.naob.no/">NAOB</a> : Det Norske Akademis Ordbok: bokmål og riksmål frå tidleg 1800-tall fram til i dag</li>
        <li><a href="https://lexin.oslomet.no/#/">LEXIN</a> : ordbøker for minoritetsspråklege elever i grunnskulen, vidaregåande og vaksenopplæring</li>
        <li><a href="http://www.islex.no/">Islex</a> : ordbok frå islandsk til norsk (bokmål og nynorsk), svensk, dansk, færøysk og finsk</li>
        <li><a href="http://www.ordnet.dk/">ordnet.dk</a> : fleire danske ordbøker og korpus</li>
        <li><a href="http://www.svenska.se/">svenska.se</a> : fleire svenske ordbøker</li>
      </ul>
  </Collapsible>
  
  <Collapsible id="education" is="h3" :header="$t('about.items[9].title')">
      <p>Blant dei norskspråklege ordbøkene og ordlistene er det berre dei som er godkjende av Språkrådet, som kan nyttast i undervisning og på prøver og eksamen. <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er blant desse, og dei andre finn du i <a href ="https://www.sprakradet.no/sprakhjelp/Skriverad/Ordlister/Ordlister-til-skulebruk/">oversikta til Språkrådet over godkjende ressursar</a>.</p>
      <p>Når skulane stengjer ein del nettsider på prøver og eksamen, må eit utval andre sider vere opne for at ordbøkene.no skal fungere. Her er domena som ordboksida brukar:</p>
      <ul>
        <li><a href="https://ordbokene.no/">https://ordbokene.no/</a></li>
        <li><a href="https://oda.uib.no/">https://oda.uib.no/</a></li>
        <li><a href="https://odd.uib.no/">https://odd.uib.no/</a></li>
        <li><a href="https://plausible.io/">https://plausible.io/</a></li>
      </ul>
      <p>Nynorsksenteret har skrive to saker om bruk av ordbøkene.no i skulen:</p>
      <ul>
        <li><a href="https://nynorsksenteret.no/vidaregaande/grammatikk/gode-tips-til-bruk-av-nettordboka">Gode tips til bruk av nettordboka</a></li>
        <li><a href="https://nynorsksenteret.no/blogg/ta-i-bruk-dei-nye-ordbokene">Ta i bruk dei nye ordbøkene</a></li>
      </ul>
      <p>Nynorsksenteret har dessutan eit opplegg for ungdomsskulen om <a href="https://nynorsksenteret.no/ungdomsskule/skriving/kreativ-skriving/hiphop-ordboka-som-kreativt-verktoy">hiphop og bruk av ordbøkene som kreative verktøy</a></p>
  </Collapsible>
  
  <Collapsible id="privacy" is="h3" :header="$t('about.items[10].title')">
    <p>Ordbøkene brukar ikkje informasjonskapslar (cookiar), men lagrar brukarinnstillingane lokalt i nettlesaren (local storage), utan at informasjonen blir sendt vidare til serveren vår på UiB. Søkjeord blir logga på serveren, men vi brukar dette berre til å lage søkjestatistikk. Vi brukar ein Nginx-webserver der loggane blir overskrivne etter ei stund, slik at IP-adressene ikkje blir lagra permanent nokon stad. Vi loggar òg bruken av enkelte funksjonar på nettsida med plausible.io, som ikkje lagrar IP-adresser eller annan informasjon som kan knyte bruksstatistikken til enkeltbrukarar.</p>
  </Collapsible>
  
  </div>
  
    <div v-if="$i18n.locale === 'nob'">
      <p>Dette er den nye nettsiden til standardordbøkene <em>Bokmålsordboka</em> og <em>Nynorskordboka.</em> Siden er fortsatt under utvikling, så enkelte funksjoner er ikke på plass ennå. Arbeidet med å revidere innholdet i ordbøkene pågår, og redaksjonen legger fortløpende ut ordartikler som er revidert og kvalitetssjekket. </p>
      <p>Dersom du vil søke i ordbøkene med det gamle grensesnittet, kan du fortsatt finne dem her: <a href="https://ordbok.uib.no/">ordbok.uib.no</a></p>
      <p>I forbindelse med oppgraderingen har vi gjort en opprydding både i grensesnittet og i dataene våre. Derfor kan det være feil og mangler i den nye løsningen vi ikke har oppdaget ennå, eller ikke har hatt tid til å få på plass. Dersom du oppdager noe som er feil eller mangelfullt, vil vi gjerne ha tilbakemelding om det! Kontakt oss gjerne på e-post:</p>
      <ul>
        <li>{{$t('contact.content[2]')}}<a href="mailto:ordbok@uib.no">ordbok@uib.no</a></li>
        <li>{{$t('contact.content[3]')}}<a href="mailto:ordbok-teknisk@uib.no">ordbok-teknisk@uib.no</a></li>
      </ul>
  
  <Collapsible id="missing-word" is="h3" :header="$t('about.items[0].title')">
            <p><em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er mellomstore nettordbøker. <em>Bokmålsordboka</em> har hatt rundt 65&nbsp;000 oppslagsord og <em>Nynorskordboka</em> rundt 90&nbsp;000, men etter <a href="http://www.uib.no/lle/revisjonsprosjektet">den revisjonen som pågår</a> regner vi med at begge skal inneholde rundt 100 000 oppslagsord. Ordbøkene skal gjøre rede for det sentrale ordforrådet, og det er i utgangspunktet de vanligste ordene i skriftspråkene bokmål og nynorsk de siste 50 årene som er tatt med. Faguttrykk er bare tatt med i den grad de også brukes utenfor fagfeltet de har oppstått i.</p>
            <p>Den vanligste måten vi lager nye norske ord på, er å sette sammen gamle ord på nye måter, og det er talløse kombinasjonsmuligheter. Derfor er det mange sammensetninger som ikke har egne artikler i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>. Selv om du ikke finner <em>sykkelsete</em> som oppslagsord her, betyr det ikke at ordet ikke finnes eller ikke er tillatt. Sammensatte ord er særlig tatt med ut fra tre hensyn:</p>
            <ul>
              <li>når de ikke umiddelbart er forståelige ut fra kjennskap til hvert enkelt ledd</li>
              <li>for at ordbokbrukeren på grunnlag av de sammensetningene som er tatt med, kan slutte seg til hva andre sammensetninger med samme forledd betyr</li>
              <li>for å vise hvilken bindebokstav sammensetningen skal ha (<em>skogbruk</em>, men <em>skog<u>s</u>arbeid</em>; <em>sakefall</em>, men <em>sak<u>es</u>løs</em>; <em>sakfører</em>, men <em>sak<u>s</u>behandler</em>; <em>ost<u>e</u>klokke</em>, men <em>dørklokke</em>)</li>
            </ul>
            <p>Tilsvarende er bare et avgrenset utvalg av avledninger (for eksempel verbalsubstantiv på <em>-ing</em>) tatt med i standardordbøkene. På norsk kan vi danne ing-former av de aller fleste verb, så finner du oppslagsordene <em>organisere</em> og <em>sitere</em> i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>, kan du selv lage avledningene organisering og sitering. Merk likevel at det finnes potensielle ing-former som sjelden blir brukt, for eksempel komming og væring.</p>
            <p><em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er ikke å betrakte som lister over hvilke ord som er tillatt å bruke på norsk. Det finnes mange ord, både gamle og nye, som ikke er med i ordbøkene, men som du gjerne kan bruke likevel. Det er heller ikke slik at nye ord må godkjennes før de kan tas i bruk, det er språkbrukerne som i fellesskap avgjør hvilke ord som er gangbare i norsk. Normalt kommer ikke nye ord inn i ordbøkene før de har vært i bruk en stund og er etablert i språket. Ordbokredaksjonen avgjør hvilke ord som skal være med basert på undersøkelser av store tekstsamlinger, og Språkrådet bestemmer hvordan ordene skal staves og bøyes.</p>
            <p><a href="https://www.sprakradet.no/Vi-og-vart/Publikasjoner/Spraaknytt/spraknytt-2014/Spraknytt-12014/Ord-som-finst-og-ikkje-finst/">Her kan du lese mer om ordutvalget</a> bl.a. i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>.</p>
            <p>Dersom du ikke finner ordet du leter etter, kan du sjekke de større og dokumenterende ordbøkene <a href="https://alfa.norsk-ordbok.no">Norsk Ordbok</a> (for dialektord og nynorsk) og <a href="https://naob.no/">NAOB</a> (for bokmål).</p>
  </Collapsible>
  
  <Collapsible id="quality" is="h3" :header="$t('about.items[1].title')">
            <p><em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er to selvstendige, enspråklige ordbøker for henholdsvis bokmål og nynorsk. Ordbøkene eies av Språkrådet og Universitetet i Bergen i fellesskap.</p>
            <p><a href="https://www.sprakradet.no/">Språkrådet</a> avgjør hvordan ord skal skrives og bøyes på bokmål og nynorsk. <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> blir løpende oppdatert i tråd med rettskrivingsvedtak i Språkrådet, så det er her du finner fasiten på hva som er gjeldende og fullstendig rettskriving i bokmål og nynorsk. </p>
          <p>Siden 2016 har det redaksjonelle arbeidet med standardordbøkene blitt utført ved Universitetet i Bergen, der flere avdelinger er involvert. <a href="https://www.uib.no/en/ub/spesial/161345/about-norwegian-language-collections">Språksamlingane</a> forvalter ordbøkene og kildegrunnlaget de bygger på, ordbokredaktørene er ansatt ved <a href="https://www.uib.no/lle">Institutt for lingvistiske, litterære og estetiske studium</a>, og det datatekniske arbeidet foregår ved IT-avdelingen. Innholdet i ordbøkene er kvalitetssikret av Språkrådet.</p>
  </Collapsible>
  
  <Collapsible id="cite" is="h3" :header="$t('about.items[2].title')">
            <p>Innholdet i Bokmålsordboka og Nynorskordboka er beskyttet av opphavsrett, jf. lov om opphavsrett til åndsverk mv. Ønsker du å sitere en artikkel i <em>Bokmålsordboka</em> eller <em>Nynorskordboka</em>, anbefaler vi å oppgi når artikkelen ble hentet (lest), f.eks. slik:</p>
            <blockquote><p>«Hvordan». I: <em>Bokmålsordboka</em>. Språkrådet og Universitetet i Bergen. <br>‹http://ordbøkene.no› (hentet 25.1.2022).</p></blockquote>
            <p>Begge eierne av ordboka, Språkrådet og Universitetet i Bergen, bør nevnes i referansen.</p>
  </Collapsible>
  
  <Collapsible id="smartphone" is="h3" :header="$t('about.items[3].title')">
            <p> Nettsiden ordbøkene.no har responsivt design, som gjør at innholdet tilpasser seg skjermer av alle størrelser. Ønsker du å ha lenken til <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> på mobilskjermen din, søker du opp ordbøkene.no i nettleseren og legger den til som ikon på skjermen. Ikonet ser ut som en app, og du kan trykke deg rett inn på nettsiden, uten å gå veien om nettleseren.</p>
            <h4>For iPhone/iOs:</h4>
            <ul>
              <li>Åpne nettleseren og skriv inn enten ordbokene.no eller ordbøkene.no.</li>
              <li>Når du er inne på forsiden, velger du ikonet nederst på siden for å dele:  <Icon name="bi:box-arrow-up" />.</li>
              <li>Det kommer opp delealternativer i to rader. I den nederste raden velger du «Legg til på Hjem-skjerm» med ikonet <Icon name="bi:plus-square-fill" /> . Det kan hende du må dra raden fra høyre for å komme til ikonet.</li>
            </ul>
            <p>Ordbøkene-ikonet <img class="ordbokene-icon" src="/favicon.ico"  aria-hidden="true"/> ligger nå på hjem-skjermen din, og du kommer direkte inn på ordboksiden ved å klikke på det.</p>
            <h4>For Android:</h4>
            <ul>
              <li>Åpne nettleseren og skriv inn enten ordbokene.no eller ordbøkene.no.</li>
              <li>Når du er inne på forsiden, velger du ikonet med de tre loddrette prikkene i øvre høyre hjørnet: <Icon name="bi:three-dots-vertical" />.</li>
              <li>Det kommer da opp en liste med valgalternativer, og du velger «Legg til på startsiden», et stykke nede på listen.</li>
              <li>Det dukker opp et vindu som foreslår at du legger til ordbøkene.no på startsiden. Klikk på valget «Legg til».</li>
            </ul>
            <p>Ordbøkene-ikonet <img class="ordbokene-icon" src="/favicon.ico" aria-hidden="true"/> ligger nå på startsiden din, og du kommer direkte inn på ordboksiden ved å klikke på det. NB! I noen modeller fra Samsung ligger valget «Legg til side i» i en meny nederst på siden. Derfra velger du startsiden.</p>
  </Collapsible>
  
  <Collapsible id="open-data" is="h3" :header="$t('about.items[4].title')">
            <p>Innholdet i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> ligger åpent tilgjengelig for nedlasting. De kan brukes til alle formål, inkludert kommersielle, i samsvar med gitte vilkår. <a href="https://www.uib.no/ub/fagressurser/spesialsamlingene/142334/lisens-bokm%C3%A5lsordboka-og-nynorskordboka">Les mer om den åpne lisensen her</a>.</p>
            <p>Informasjonen i bøyingstabellene i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er hentet fra Norsk ordbank. Ordbanken er en leksikalsk database for bokmål og nynorsk med informasjon om ordklasse og normert bøying for langt flere ord enn de som er oppslagsord i standardordbøkene. Norsk ordbank ligger <a href="https://www.nb.no/sprakbanken/ressurskatalog/?_search=ordbank">tilgjengelig for nedlasting hos Språkbanken</a> ved Nasjonalbiblioteket under lisensen CC-BY. </p>
  </Collapsible>
  
  <Collapsible id="history" is="h3" :header="$t('about.items[5].title')">
            <p><em>Bokmålsordboka</em> og <em>Nynorskordboka</em> ble utgitt første gang i 1986, produsert gjennom et samarbeidsprosjekt mellom Universitetet i Oslo og Norsk Språkråd, og er siden kommet i flere utgaver. I trykt form er <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> store ettbinds ordbøker. De viser skrivemåter og bøying som alltid er i tråd med de gjeldende normene. Videre oppgir ordbøkene betydninger, brukseksempler og korte etymologier.</p>
          <p><a href="https://www.uib.no/sites/w3.uib.no/files/attachments/om_ordbokene.pdf">Her finner du forordene til de trykte utgavene</a> og mer informasjon om tidligere ordbokredaktører og arbeidet med ordbøkene ved Universitetet i Oslo.</p>
            <p>Universitetet i Bergen og Språkrådet kommer ikke til publisere flere trykte utgaver av standardordbøkene.</p>
  </Collapsible>
  
  <Collapsible id="revision" is="h3" :header="$t('about.items[6].title')">
            <p>Det pågår for tiden et omfattende arbeid med å oppdatere innholdet i <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>. I perioden 2018–2023 går en gruppe redaktører gjennom begge ordbøkene fra a til å. De viktigste oppgavene er å få inn nye ord og betydninger, passe på at innholdet er i tråd med dagens språkbruk, og gjøre utvalget av ord likere i de to ordbøkene. Mer informasjon finner du på  <a href="https://www.uib.no/lle/revisjonsprosjektet">nettsiden til Revisjonsprosjektet</a>.</p>
            <p>Nåværende redaksjon for <em>Bokmålsordboka</em> og <em>Nynorskordboka</em>:</p>
            <ul class="no-bullet">
              <li>Anne Engø, redaktør 2018–2023</li>
              <li>Marita Kristiansen, redaktør 2020–2021</li>
              <li>Gunn Inger Lyse, redaktør 2018–2023</li>
              <li>Mikkel Ekeland Paulsen, stipendiat 2019–2023</li>
              <li>Margunn Rauset, prosjektleder 2018–2023</li>
              <li>Bente Selback, redaktør 2018–2023</li>
              <li>Kari-Anne Selvik, redaktør 2018–2023</li>
              <li>Klara Sjo, redaktør 2020–2022</li>
              <li>Marie Lund Stokka, redaktør 2020</li>
              <li>Terje Svardal, redaktør ved Språksamlingene</li>
            </ul>
            <p>Kvalitetskontrollører i Språkrådet:</p>
            <ul class="no-bullet">
              <li>Sturla Berg-Olsen, seniorrådgiver</li>
              <li>Knut E. Karlsen, seniorrådgiver</li>
              <li>Dagfinn Rødningen, seniorrådgiver</li>
              <li>Ålov Runde, seniorrådgiver</li>
            </ul>
            <p>Denne siden har blitt utformet av utviklere på IT-avdelingen ved Universitetet i Bergen og Språksamlingane:</p>
            <ul class="no-bullet">
              <li>Henrik Askjer, overingeniør, Språksamlingane</li>
              <li>Eirik T. Gullaksen, overingeniør, IT-avdelingen</li>
              <li>Paul Meurer, senioringeniør, Språksamlingane</li>
              <li>Silje Scholl, avdelingsingeniør, IT-avdelingen 2022</li>
              <li>Nils Øverås, overingeniør, IT-avdelingen</li>
              <li>Ole Voldsæter, overingeniør, IT-avdelingen 2019–2021</li>
            </ul>
            <p><a href="https://www.netlife.com/">Netlife</a> har gjennomført brukerundersøkelser og utarbeidet designskisser til ordbøkene.no.</p>
  </Collapsible>
  
  <Collapsible id="grammar" is="h3" :header="$t('about.items[7].title')">
            <p>Kodene nedenfor viser de regelrette bøyningene for substantiv, adjektiv og verb. Ord med med ufullstendige eller uregelrette bøyninger i disse ordklassene har koder uten tall. De er merket med f. (femininum, hunkjønn), m. (maskulinum, hankjønn), n. (nøytrum, intetkjønn), subst. (substantiv), adj. (adjektiv) eller v. (verb).</p>
            <h4>Substantiv (Bokmålsordboka)</h4>
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Kode</th>
                  <th>Ubestemt form entall</th>
                  <th>Bestemt form entall</th>
                  <th>Ubestemt form flertall</th>
                  <th>Bestemt form flertall</th>
                </tr>
                <tr>
                  <td rowspan="2">f1</td>
                  <td>bru</td>
                  <td>brua</td>
                  <td>bruer</td>
                  <td>bruene</td>
                </tr>
                <tr>
                  <td>pumpe</td>
                  <td>pumpa</td>
                  <td>pumper</td>
                  <td>pumpene</td>
                </tr>
                <tr>
                  <td rowspan="3">m1</td>
                  <td>stol</td>
                  <td>stolen</td>
                  <td>stoler</td>
                  <td>stolene</td>
                </tr>
                <tr>
                  <td>bakke</td>
                  <td>bakken</td>
                  <td>bakker</td>
                  <td>bakkene</td>
                </tr>
                <tr>
                  <td>pumpe</td>
                  <td>pumpen</td>
                  <td>pumper</td>
                  <td>pumpene</td>
                </tr>
                <tr>
                  <td rowspan="2">m2</td>
                  <td>lærer</td>
                  <td>læreren</td>
                  <td>lærere</td>
                  <td>lærerne</td>
                </tr>
                <tr>
                  <td>dommer</td>
                  <td>dommeren</td>
                  <td>dommere</td>
                  <td>dommerne</td>
                </tr>
                <tr>
                  <td rowspan="2">m3</td>
                  <td>bever</td>
                  <td>beveren</td>
                  <td>bevere, bevrer el. bevre</td>
                  <td>beverne el. bevrene</td>
                </tr>
                <tr>
                  <td>sommer</td>
                  <td>sommeren</td>
                  <td>sommere, somrer el. somre</td>
                  <td>sommerne el. somrene</td>
                </tr>
                <tr>
                  <td>n1</td>
                  <td>slott</td>
                  <td>slottet</td>
                  <td>slott</td>
                  <td>slotta el. slottene</td>
                </tr>
                <tr>
                  <td rowspan="2">n2</td>
                  <td>salt</td>
                  <td>saltet</td>
                  <td>salter</td>
                  <td>salta el. saltene</td>
                </tr>
                <tr>
                  <td>eple</td>
                  <td>eplet</td>
                  <td>epler</td>
                  <td>epla el. eplene</td>
                </tr>
                <tr>
                  <td rowspan="2">n3</td>
                  <td>kontor</td>
                  <td>kontoret</td>
                  <td>kontor el. kontorer</td>
                  <td>kontora el. kontorene</td>
                </tr>
                <tr>
                  <td>høve</td>
                  <td>høvet</td>
                  <td>høve el. høver</td>
                  <td>høva el. høvene</td>
                </tr>
              </tbody>
            </table>
            <h4>Adjektiv (Bokmålsordboka)</h4>
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Kode</th>
                  <th>Hankjønn og hunkjønn</th>
                  <th>Intetkjønn</th>
                  <th>Bestemt form</th>
                  <th>Flertall</th>
                </tr>
                <tr>
                  <td>a1</td>
                  <td>god</td>
                  <td>godt</td>
                  <td>gode</td>
                  <td>gode</td>
                </tr>
                <tr>
                  <td>a2</td>
                  <td>norsk</td>
                  <td>norsk</td>
                  <td>norske</td>
                  <td>norske</td>
                </tr>
                <tr>
                  <td rowspan="2">a3</td>
                  <td>ekte</td>
                  <td>ekte</td>
                  <td>ekte</td>
                  <td>ekte</td>
                </tr>
                <tr>
                  <td>oppskjørta</td>
                  <td>oppskjørta</td>
                  <td>oppskjørta</td>
                  <td>oppskjørta</td>
                </tr>
                <tr>
                  <td>a4</td>
                  <td>oppskjørtet</td>
                  <td>oppskjørtet</td>
                  <td>oppskjørtede el. oppskjørtete</td>
                  <td>oppskjørtede el. oppskjørtete</td>
                </tr>
                <tr>
                  <td rowspan="2">a5</td>
                  <td>makaber</td>
                  <td>makabert</td>
                  <td>makabre</td>
                  <td>makabre</td>
                </tr>
                <tr>
                  <td>lunken</td>
                  <td>lunkent</td>
                  <td>lunkne</td>
                  <td>lunkne</td>
                </tr>
              </tbody>
            </table>
            <h4>Verb (Bokmålsordboka)</h4>
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Kode</th>
                  <th>Infinitiv</th>
                  <th>Presens (Nåtid)</th>
                  <th>Preteritum (Fortid)</th>
                  <th>Perfektum partisipp (Supinum)</th>
                </tr>
                <tr>
                  <td rowspan="2">v1</td>
                  <td>kaste</td>
                  <td>kaster</td>
                  <td>kasta el. kastet</td>
                  <td>kasta el. kastet</td>
                </tr>
                <tr>
                  <td>bie</td>
                  <td>bier</td>
                  <td>bia el. biet</td>
                  <td>bia el. biet</td>
                </tr>
                <tr>
                  <td rowspan="2">v2</td>
                  <td>lyse</td>
                  <td>lyser</td>
                  <td>lyste</td>
                  <td>lyst</td>
                </tr>
                <tr>
                  <td>lesse</td>
                  <td>lesser</td>
                  <td>lesste</td> 
                  <td>lesst</td>
                </tr>
                <tr>
                  <td>v3</td>
                  <td>leve</td>
                  <td>lever</td>
                  <td>levde</td>
                  <td>levd</td>
                </tr>
                <tr>
                   <td rowspan="2">v4</td>
                  <td>nå</td>
                  <td>når</td>
                  <td>nådde</td>
                  <td>nådd</td>
                </tr>
                <tr>
                  <td>bie</td>
                  <td>bier</td>
                  <td>bidde</td>
                  <td>bidd</td>
                </tr>
              </tbody>
            </table>
            <h4>Substantiv (Nynorskordboka)</h4>
            <table class="table table-bordered">
              <tr>
                <th>Kode</th>
                <th>Ubunden form eintal</th>
                <th>Bunden form eintal</th>
                <th>Ubunden form fleirtal</th>
                <th>Bunden form fleirtal</th>
              </tr>
              <tr>
                <td>f1</td>
                <td> bygd</td>
                <td> bygda</td>
                <td> bygder</td>
                <td> bygdene</td>
              </tr>
              <tr>
                <td>f2</td>
                <td> vise</td>
                <td> visa</td>
                <td> viser</td>
                <td> visene</td>
              </tr>
              <tr>
                 <td>f3</td>
                <td> dronning</td>
                <td> dronninga</td>
                <td> dronningar</td>
                <td> dronningane</td>
              </tr>
              <tr>
                <td rowspan="3">m1</td>
                <td> båt</td>
                <td> båten</td>
                <td> båtar</td>
                <td> båtane</td>
              </tr>
              <tr>
                <td>hage</td>
                <td>hagen</td>
                <td>hagar</td>
                <td>hagane</td>
              </tr>
              <tr>
                <td> lærar</td>
                <td> læraren</td>
                <td> lærarar</td>
                <td> lærarane</td>
              </tr>
              <tr>
                <td rowspan="2">n1</td>
                <td> hus</td>
                <td> huset</td>
                <td> hus</td>
                <td> husa</td>
              </tr>
              <tr>
                <td> rike</td>
                <td> riket</td>
                <td> rike</td>
                <td> rika</td>
              </tr>
            </table>
            <h4>Adjektiv (Nynorskordboka)</h4>
            <table class="table table-bordered">
              <tr>
                <th>Kode</th>
                <th>Hankjønn og hokjønn</th>
                <th>Inkjekjønn</th>
                <th>Bunden form</th>
                <th>Fleirtal</th>
              </tr>
              <tr>
                <td>a1</td>
                <td> sterk</td>
                <td> sterkt</td>
                <td> sterke</td>
                <td> sterke</td>
              </tr>
              <tr>
                <td>a2</td>
                <td> norsk</td>
                <td> norsk</td>
                <td> norske</td>
                <td> norske</td>
              </tr>
              <tr>
                 <td>a3</td>
                <td> grepa</td>
                <td> grepa</td>
                 <td> grepa</td>
                <td> grepa</td>
              </tr>
              <tr>
                <td>a4</td>
                <td> open</td>
                <td> ope el. opent</td>
                <td> opne</td>
                <td> opne</td>
              </tr>
              <tr>
                <td>a5</td>
                <td> vaksen</td>
                <td> vakse</td>
                <td> vaksne</td>
                <td> vaksne</td>
              </tr>
            </table>
            <h4>Verb (Nynorskordboka)</h4>
            <table class="table table-bordered">
              <tr>
                <th>Kode</th>
                <th>Infinitiv</th>
                <th>Presens (Notid)</th>
                <th>Preteritum (Fortid)</th>
                <th>Perfektum partisipp (Supinum)</th>
              </tr>
              <tr>
                <td rowspan="2">v1</td>
                <td> kasta el. kaste</td>
                <td> kastar</td>
                <td> kasta</td>
                <td> kasta</td>
              </tr>
              <tr>
                <td> ropa el. rope</td>
                <td> ropar</td>
                <td> ropa</td>
                <td> ropa</td>
              </tr>
              <tr>
                <td rowspan="2">v2</td>
                <td> kvila el. kvile</td>
                <td> kviler</td>
                <td> kvilte</td>
                <td> kvilt</td>
              </tr>
              <tr>
                 <td>ropa el. rope</td>
                <td> roper</td>
                 <td> ropte</td>
                <td> ropt</td>
              </tr>
              <tr>
                <td>v3</td>
                <td> ropa el. rope</td>
                <td> ropar</td>
                <td> ropte</td>
                <td> ropt</td>
              </tr>
            </table>
  
  </Collapsible>
  
  <Collapsible id="links" is="h3" :header="$t('about.items[8].title')">
            <p>Har du spørsmål om klar, god og korrekt språkbruk, kan du ta kontakt med <a href="mailto:sporsmal@sprakradet.no">Språkrådets svartjeneste</a>.</p>
            <h4>Språkressurser på nettet</h4>
            <p>Språksamlingene ved Universitetsbiblioteket i Bergen har en rekke språkressurser, blant annet:</p>
            <ul>
              <li><a href="https://ord.uib.no/">ord.uib.no:</a> ordlister og API-beskrivelse for Ordbøkene (<a href="https://ordbokene.no/api/swagger-ui.html">interaktiv dokumentasjon</a>).</li>
              <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=72&tabid=1106">Norsk ordbank, bokmål:</a> søk i fullformslister for bokmål</li>
              <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=73&tabid=1116">Norsk ordbank, nynorsk:</a> søk i fullformslister for nynorsk</li>
              <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=7&tabid=571">Metaordboka:</a> felles database over alle dokumenterte ord sortert på normert nynorsk oppslagsord</li>
              <li><a href="http://inger.uib.no/perl/search/search.cgi?appid=118&tabid=1777">Ordbokhotellet:</a> elektronisk indeks over ordformer fra en rekke lokale ordsamlinger sortert under normert oppslagsform</li>
              <li><a href="http://inger.uib.no/perl/search/search.cgi">Alle digitale språkressurser under språksamlingene</a></li>
            </ul>
            <p><a href="http://www.sprakradet.no/">Språkrådet</a> har mange språkressurser samlet under menyen Språkhjelp, gå til <a href="http://www.sprakradet.no/sprakhjelp/Skriveregler/">skriveregler</a>, <a href="http://www.sprakradet.no/sprakhjelp/Praktisk-grammatikk/">praktisk grammatikk</a> eller <a href="http://www.sprakradet.no/sprakhjelp/Skriverad/">skriveråd</a>.</p>
            <p>Norsk ordbank ligger også tilgjengelig for nedlasting hos <a href="https://www.nb.no/sprakbanken/ressurskatalog/?_search=ordbank">Språkbanken ved Nasjonalbiblioteket</a> under lisensen CC-BY. Ordbanken inneholder bl.a. fullformslister for bokmål og nynorsk med informasjon om ordklasse og normert bøying.</p>
            <h4>Andre kvalitetssikrede og fritt tilgjengelige ordbøker</h4>
            <ul>
            <li><a href="https://alfa.norsk-ordbok.no/">Norsk Ordbok:</a> Ordboka over det norske folkemålet og det nynorske skriftmålet</li>
              <li><a href="https://naob.no/">NAOB:</a> Det Norske Akademis Ordbok: bokmål og riksmål fra tidlig 1800-tall fram til i dag</li>
              <li><a href="http://lexin.udir.no/">LEXIN:</a> ordbøker for minoritetsspråklige elever i grunnskolen, videregående og voksenopplæring</li>
              <li><a href="http://www.islex.no/">Islex:</a> ordbok fra islandsk til norsk (bokmål og nynorsk), svensk, dansk, færøysk og finsk</li>
              <li><a href="http://ordnet.dk/">ordnet.dk:</a> flere danske ordbøker og korpus</li>
              <li><a href="https://svenska.se/">svenska.se:</a> flere svenske ordbøker</li>
            </ul>
  </Collapsible>
  
  <Collapsible id="education" is="h3" :header="$t('about.items[9].title')">
            <p>Blant norskspråklige ordbøker og ordlister er det bare de som er godkjent av Språkrådet, som kan brukes i undervisning og på prøver og eksamen. <em>Bokmålsordboka</em> og <em>Nynorskordboka</em> er blant disse, og de andre finner du på <a href ="https://www.sprakradet.no/sprakhjelp/Skriverad/Ordlister/Ordlister-til-skulebruk/"> Språkrådets oversikt over godkjente ressurser</a>.</p>
            <p>Når skolene stenger en del nettsider på prøver og eksamen, må et utvalg andre sider være åpne for at ordbøkene.no skal fungere. Her er domenene som ordboksida bruker:</p>
           <ul>
              <li><a href="https://ordbokene.no/">https://ordbokene.no/</a></li>
              <li><a href="https://oda.uib.no/">https://oda.uib.no/</a></li>
              <li><a href="https://odd.uib.no/">https://odd.uib.no/</a></li>
              <li><a href="https://plausible.io/">https://plausible.io/</a></li>
            </ul>
            <p>Nynorsksenteret har skrevet to saker om bruk av ordbøkene.no i skolen:</p>
            <ul>
              <li><a href="https://nynorsksenteret.no/vidaregaande/grammatikk/gode-tips-til-bruk-av-nettordboka">Gode tips til bruk av nettordboka</a></li>
              <li><a href="https://nynorsksenteret.no/blogg/ta-i-bruk-dei-nye-ordbokene">Ta i bruk dei nye ordbøkene</a></li>
            </ul>
            <p>Nynorsksenteret har dessuten et opplegg for ungdomsskolen om <a href="https://nynorsksenteret.no/ungdomsskule/skriving/kreativ-skriving/hiphop-ordboka-som-kreativt-verktoy">hiphop og bruk av ordbøkene som kreative verktøy</a></p>   
  </Collapsible>
  
  <Collapsible id="privacy" is="h3" :header="$t('about.items[10].title')">
            <p>Ordbøkene bruker ikke informasjonskapsler (cookier), men lagrer brukerinnstillinger lokalt i nettleseren (local storage), uten å sende denne informasjonen til vår server på UiB. Søkeord logges på serveren, 
              men dette bruker vi kun til å lage søkestatistikk. Vi benytter en Nginx-webserver der loggene overskrives etter en stund, slik at IP-adressene ikke lagres permanent noe sted. Vi logger også bruken av enkelte 
              funksjoner på nettsiden med plausible.io, som ikke lagrer IP-adresser eller annen informasjon som kan knytte bruksstatistikken til bestemte brukere.</p>
  </Collapsible>
  
  
  </div>
  
  </main>
  </template>
  
  <script setup>
  import { useI18n } from 'vue-i18n'
  
  const { t } = useI18n()
  
  useHead({
    title: t('about.title')
    })
  </script>
  
  <style scoped>
  
  .no-bullet {
    list-style-type: none;
  }
  
  .ordbokene-icon {
    width: 1.25rem;
    height: fit-content;
  }
  </style>
  
