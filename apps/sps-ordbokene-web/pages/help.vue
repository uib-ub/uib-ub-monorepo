<template>
<main id="main" tabindex="-1" class="secondary-page">
  <h2>{{$t('help')}}</h2>
<div v-if="$i18n.locale === 'eng'">
  <p>Search the website by entering a word, press <kbd>return</kbd> or pick a search suggestion in the drop-down menu. Press <kbd>/</kbd> whenever you want to jump back to the search box.
    The heading of each search result is a link to a lookup page for the article in question. If you get no more than one result in each dictionary, the entire article is shown in the list of results, and you won't need to click the link. If there are more resutls, you may expand the article content in the results list by clicking "Show article" at the bottom of the result item. You can make the articles expand by default in the settings below.
    </p><p>
    The dictionary from which to get search results depends on the dictionary selected, and if the word is used in both written languages. Currently, the two dictionaries are not linked at word level. Thus a ‘Did you mean’ function has been developed. The hope is that this function will be helpful in finding the right words in both Bokmål and Nynorsk. It is possible to search for fixed expressions, e.g.
    <em>gi katten i</em> (not give a damn). It is also possible to find such expressions at the end of each article or the articles they are linked to. When typing a single word in the search field, the drop-down menu also shows the common expressions the word is part of.
</p>
<AdvancedHelp/>
  </div>

<div  v-if="$i18n.locale === 'nob'">
  <p>Du søker ved å skrive inn ordet og trykke på returtasten (<kbd>enter</kbd>) eller velge et søkeforslag i nedtrekksmenyen. Tast <kbd>Shift</kbd>+<kbd>7</kbd> hvis du vil hoppe tilbake til søkefeltet etter å ha søkt.
  Overskriften i toppen av hvert søketreff er en lenke til en ny artikkelside for det aktuelle ordet. Hvis du ikke får mer enn ett treff i hver ordbok, vises hele artikkelen i resultatlisten, og du trenger ikke trykke på lenken. Er det flere treff, kan du også vise artikkelinnholdet i resultatlisten ved å trykke på "Vis artikkel" i bunnen av søketreffet. Se innstillingene nedenfor hvis du ønsker at resultatlisten alltid skal vise fullstendige artikler.</p>
  <p>Hvilken ordbok du får treff i, avhenger av hvilken ordbok du har valgt å søke i, og om ordet blir brukt i begge skriftspråkene. Det ligger per i dag ikke inne koblinger mellom ordbøkene, men vi har utviklet en mente-du-funksjon, som vi håper blir til hjelp for å finne de riktige ordene både i bokmål og nynorsk.</p>
  <p>Du kan søke direkte på faste uttrykk, f.eks. <em>gi katten i</em>. Alternativt finner du uttrykkene samlet til slutt i artikkelen eller artiklene de er knyttet til. Når du skriver inn et enkelt ord i søkefeltet, viser nedtrekksmenyen også de faste uttrykkene som ordet inngår i.</p>
  
  <AdvancedHelp/>
</div>


<div  v-if="$i18n.locale === 'nno'">
  <p>Du søkjer ved å skrive inn ordet og trykkje på returtasten (<kbd>enter</kbd>) eller velje eit søkjeforslag i nedtrekksmenyen. Tast <kbd>Shift</kbd>+<kbd>7</kbd> dersom du vil hoppa tilbake til søkjefeltet etter å ha søkt.
  Overskrifta i toppen av kvart søkjetreff er ei lenkje til ei ny artikkelside for det aktuelle ordet. Om du ikkje får meir enn eitt treff i kvar ordbok, viser heile artikkelen i resultatlista, og du treng ikkje trykkje på lenkja. Er det fleire treff, kan du òg sjå artikkelinnhaldet i resultatlista ved å trykkje på "Vis artikkel" i botnen av søkjetreffet. Sjå innstillingane nedanfor om du ønskjer at resultatlista alltid skal vise fullstendige artiklar.
    </p><p>
    Kva ordbok du får treff i, avheng av kva ordbok du har valt å søkje i, og om ordet blir brukt i begge skriftspråka. Det ligg per i dag ikkje inne koplingar mellom ordbøkene, men vi har utvikla ein meinte-du-funksjon, som vi håpar blir til hjelp for å finne dei riktige orda både i bokmål og nynorsk.</p>
    <p>Du kan søkje direkte på faste uttrykk, t.d. <em>gi katten i</em>. Alternativt finn du uttrykka samla til slutt i artikkelen eller artiklane dei er knytte til. Når du skriv inn eit enkelt ord i søkjefeltet, viser nedtrekksmenyen òg dei faste uttrykka som ordet er ein del av.</p>
    <AdvancedHelp/>
</div>



</main>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useHead({
  title: t('help')
  })
</script>
