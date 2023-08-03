<template>
  <div v-if="$i18n.locale === 'eng'">
    <h3>Wildcard search</h3>
    <p>If unsure of the spelling of a word or want results from more than one article, it is possible to use <kbd>%</kbd>
      and <kbd>*</kbd> to replace zero, one or more characters.
      Underscore (<kbd>_</kbd>) replaces only one character. You may use the wilcard symbols multiple times in your search
      expression.</p>

    <h4>Examples</h4>
    <ul>
      <li>The search query “<a href="https://ordbokene.no/bm,nn/search?q=arbeid%2ar&scope=ei">arbeid*r</a>”, will result
        in results in the drop-down menu with “arbeider” (worker) in the Bokmål dictionary and “arbeidar” (worker) in the
        Nynorsk Dictionary.</li>
      <li>The search query “<a href="https://ordbokene.no/bm,nn/search?q=inter%25es%25ant&scope=ei">inter%es%ant</a>”
        returns the result “interessant” (interesting) in both dictionaries. </li>
      <li>The search query “<a
          href="https://ordbokene.no/bm,nn/search?q=f%C3%B8rsk%25l%C3%A6r_r&scope=ei">førsk%lær_r</a>” gives resutls for
        “førskolelærer” (pre-school teacher) in the Bokmål dictionary and “førskolelærar/førskulelærar” (pre-school
        teacher) in the Nynorsk dictionary.</li>
      <li>The search query «<a href="https://ordbokene.no/bm,nn/search?q=ku__&scope=e">ku__</a>» returns four letter words
        starting with «ku».</li>
    </ul>

    <h3>Combine search terms</h3>
    <p>The symbol <kbd>|</kbd> allows you to use in several search words at the same time. You can also combine search
      words that contain wildcard symbols.</p>

    <h4>Examples</h4>
    <ul>
      <li>The search “<a
          href="https://ordbokene.no/bm,nn/search?q=kj%C3%A6rlighet%7Ckj%C3%A6rleik&scope=ei">kjærlighet|kjærleik</a>”
        yields the result “kjærlighet” in the Bokmål dictionary and “kjærleik” (love) in the Nynorsk dictionary.</li>
      <li>The search “<a href="https://ordbokene.no/bm,nn/search?q=undervis_r%7Cl%C3%A6r_r&scope=ei">undervis_r|lær_r</a>”
        results in “underviser” (teacher) and “lærer” (teacher) in the Bokmål dictionary and “undervisar” and “lærar” in
        the Nynorsk dictionary.</li>
    </ul>
  </div>

  <div v-if="$i18n.locale === 'nob'">
    <h3>Søk med jokertegn</h3>
    <p>Dersom du er usikker på skrivemåten av et ord eller ønsker treff i mer enn én artikkel, kan du bruke <kbd>%</kbd>
      og <kbd>*</kbd> for å få treff på null, ett eller flere tegn.
      Symbolet <kbd>_</kbd> erstatter kun ett tegn. Du kan plassere jokertegnene flere steder i søkeordet.</p>

    <h4>Eksempler</h4>
    <ul>
      <li>Søker du på «<a href="https://ordbokene.no/bm,nn/search?q=arbeid%2ar&scope=ei">arbeid*r</a>», er de første
        treffene i nedtrekksmenyen «arbeider» i <em>Bokmålsordboka</em> og «arbeidar» i <em>Nynorskordboka</em>.</li>
      <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=inter%25es%25ant&scope=ei">inter%es%ant</a>» gir treff på
        «interessant» i begge ordbøkene. </li>
      <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=f%C3%B8rsk%25l%C3%A6r_r&scope=ei">førsk%lær_r</a>» gir treff
        på «førskolelærer» i <em>Bokmålsordboka</em> og «førskolelærar/førskulelærar» i <em>Nynorskordboka</em>.</li>
      <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=ku__&scope=e">ku__</a>» gir treff på ord på fire bokstaver
        som begynner med «ku».</li>
    </ul>

    <h3>Kombiner søkeord</h3>
    <p>Symbolet <kbd>|</kbd> gjør det mulig å søke med flere søkeord samtidig. Det er også mulig å kombinere søkeord som
      inneholder jokertegn.</p>

    <h4>Eksempler</h4>
  <ul>
    <li>Søket «<a
        href="https://ordbokene.no/bm,nn/search?q=kj%C3%A6rlighet%7Ckj%C3%A6rleik&scope=ei">kjærlighet|kjærleik</a>» gir
      treff på «kjærlighet» i <em>Bokmålsordboka</em> og «kjærleik» i <em>Nynorskordboka</em>.</li>
    <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=undervis_r%7Cl%C3%A6r_r&scope=ei">undervis_r|lær_r</a>» gir
      treff på «underviser» og «lærer» i <em>Bokmålsordboka</em> og «undervisar» og «lærar» i <em>Nynorskordboka</em>.
    </li>
  </ul>
</div>


<div v-if="$i18n.locale === 'nno'">
  <h3>Søk med jokerteikn</h3>
  <p>Dersom du er usikker på skrivemåten av eit ord eller ønskjer treff i meir
    enn éin artikkel, kan du bruke <kbd>%</kbd> og <kbd>*</kbd> for å få treff på null, eitt eller fleire teikn.
    Symbolet <kbd>_</kbd> erstattar berre eitt teikn. Du kan plassere jokerteikna fleire stader i søkjeordet.</p>

  <h4>Døme</h4>
  <ul>
    <li>Søkjer du på «<a href="https://ordbokene.no/bm,nn/search?q=arbeid%2ar&scope=ei">arbeid*r</a>», er dei første
      treffa i nedtrekksmenyen «arbeider» i <em>Bokmålsordboka</em> og «arbeidar» i <em>Nynorskordboka</em>.</li>
    <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=inter%25es%25ant&scope=ei">inter%es%ant</a>» gjev treff på
      «interessant» i begge ordbøkene. </li>
    <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=f%C3%B8rsk%25l%C3%A6r_r&scope=ei">førsk%lær_r</a>» gjev
      treff på «førskolelærer» i <em>Bokmålsordboka</em> og «førskolelærar/førskulelærar» i <em>Nynorskordboka</em>.
    </li>
    <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=ku__&scope=e">ku__</a>» gjev treff på ord på fire bokstavar
      som startar på «ku».</li>
  </ul>

  <h3>Kombiner søkjeord</h3>
  <p>Symbolet <kbd>|</kbd> gjer det mogleg å søkje med fleire søkjeord samtidig. Det er òg mogleg å kombinere søkjeord
    som inneheld jokerteikn.</p>

  <h4>Døme</h4>
  <ul>
    <li>Søket «<a
        href="https://ordbokene.no/bm,nn/search?q=kj%C3%A6rlighet%7Ckj%C3%A6rleik&scope=ei">kjærlighet|kjærleik</a>»
      gjev treff på «kjærlighet» i <em>Bokmålsordboka</em> og «kjærleik» i <em>Nynorskordboka</em>.</li>
    <li>Søket «<a href="https://ordbokene.no/bm,nn/search?q=undervis_r%7Cl%C3%A6r_r&scope=ei">undervis_r|lær_r</a>» gjev
      treff på «underviser» og «lærer» i <em>Bokmålsordboka</em> og «undervisar» og «lærar» i <em>Nynorskordboka</em>.
    </li>
  </ul>
</div></template>