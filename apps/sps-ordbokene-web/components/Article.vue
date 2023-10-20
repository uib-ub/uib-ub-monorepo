<template>
  <div class="list-view-item" v-if="list && !welcome" :lang="dictLang[dict]">
      <span v-if="pending" class="list-view-item"><div class="skeleton skeleton-content w-25"/><div class="skeleton skeleton-content w-50"/></span>
      <NuxtLink v-else class="result-list-item" :to="link_to_self()">

  <div v-for="(lemma_group, i) in lemma_groups" :key="i">
  <span class="lemma-group">

    <span v-for="(lemma, index) in lemma_group.lemmas"
          :key="index"><span class="lemma"><DefElement v-if="lemma.annotated_lemma" :body="lemma.annotated_lemma" tag="span" :content_locale="content_locale"/><span v-else>{{lemma.lemma}}</span></span>
          <span v-if="lemma.hgno" class="hgno">{{"\xa0"}}<span class="sr-only">{{parseInt(lemma.hgno)}}</span><span aria-hidden="true">{{roman_hgno(lemma)}}</span></span>
                    <span
                   class="title_comma"
                   v-if="lemma_group.lemmas[1] && index < lemma_group.lemmas.length-1">{{", "}}
                  </span>
    </span>
</span>
<span v-if="secondary_header_text">,&nbsp;<span class="lemma-group lemma">{{secondary_header_text}}</span></span>
  &nbsp;<em v-if="lemma_group.description" class="subheader ">
  <span class="header_group_list">{{lemma_group.description}}</span>
        {{lemma_group.pos_group}}
  <span v-if="settings.inflectionNo" class="inflection_classes">{{lemma_group.inflection_classes}}</span>

  </em>
</div>{{snippet}}

    </NuxtLink>
  </div>
    <div :lang="dictLang[dict]" class="article flex flex-col justify-between" v-else-if="!error">
      <div v-if="false && pending && !welcome" class="skeleton-container">
            <div class="skeleton mt-4 skeleton-heading"/>
        <div class="skeleton mt-2 mb-4 skeleton-subheading"/>
        <div class="skeleton skeleton-content w-50 "/>
        <div class="skeleton skeleton-content w-25 skeleton-indent"/>
        <div class="skeleton skeleton-content w-75"/>
        <div class="skeleton skeleton-content w-25 skeleton-indent"/>
        <div class="skeleton skeleton-content w-50"/>
        <div class="skeleton skeleton-content w-75 skeleton-indent"/>
        <div class="skeleton skeleton-content w-25"/>
        </div>
        <div v-else>
          
        <h2 v-if="welcome" class="dict-label">{{$t('monthly', {dict: $t('dicts_inline.' + dict)}, { locale: content_locale})}}</h2>
        <h2 v-else-if="single" class="dict-label article-dict-label">{{{"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[dict]}}</h2>
        <div :class="welcome? 'px-4 pb-3 pt-4' : 'px-4 pt-4 pb-2'">

        <ArticleHeader :lemma_groups="lemma_groups" :secondary_header_text="secondary_header_text" :content_locale="content_locale" :dict="dict" :article_id="article_id"/>
      
      <div v-if="data.lemmas[0].split_inf" class="mt-2 mb-3">
        <div class="flex gap-2 align-middle">{{$t('split_inf.title')}}: -a
        <button type="button" :aria-expanded="split_inf_expanded" aria-controls="split-inf-explanation" @click="split_inf_expanded = !split_inf_expanded" class="rounded leading-none !p-0 !text-primary hover:bg-primary-lighten bg-primary  border-primary-lighten">
          <Icon :name="split_inf_expanded? 'bi:dash' : 'bi:plus'" class="text-white !m-0 !p-0" size="1.5em"/>
        </button>
        </div>
        
        <div class="mb-4 my-2" id="split-inf-explanation" v-if="split_inf_expanded">
          {{$t('split_inf.content[0]', content_locale)}} <em>-a</em> {{$t('split_inf.content[1]', content_locale)}}
          <a target="_blank" 
             href="https://www.sprakradet.no/svardatabase/sporsmal-og-svar/kloyvd-infinitiv-/">{{$t('split_inf.content[2]', content_locale)}}</a>
        </div>
        </div>

      <button type="button" v-if="!settings.inflectionExpanded && inflected && !welcome" 
              class="btn btn-primary my-1 border-primary-darken !pr-2" 
              @click="expand_inflection" 
              :lang="locale2lang[content_locale]"
              :aria-expanded="inflection_expanded" 
              :aria-controls="inflection_expanded ? 'inflection-'+article_id : null">
             {{$t('article.show_inflection')}}<span v-if="!inflection_expanded"><Icon name="bi:chevron-down" class="ml-4" size="1.5em"/></span><span v-if="inflection_expanded"><Icon name="bi:chevron-up" class="ml-4" size="1.5em"/></span>
      </button>
        <div v-if="inflected && !welcome && (inflection_expanded || settings.inflectionExpanded)" class="motion-reduce:transition-none border-collapse py-2 transition-all duration-300 ease-in-out" :id="'inflection-'+article_id" ref="inflection_table">
            <div class="inflection-container p-2">
                <NuxtErrorBoundary @error="inflection_error">
                <InflectionTable :content_locale="content_locale" :class="store.dict == 'bm,nn' ? 'xl:hidden' : 'sm:hidden'" mq="xs" :eng="$i18n.locale == 'eng'" :ukr="$i18n.locale == 'ukr'" :lemmaList="lemmas_with_word_class_and_lang" :context="true" :key="$i18n.locale"/>
                <InflectionTable :content_locale="content_locale" :class="store.dict == 'bm,nn' ? 'hidden xl:flex' : 'hidden sm:flex'" mq="sm" :eng="$i18n.locale == 'eng'" :ukr="$i18n.locale == 'ukr'" :lemmaList="lemmas_with_word_class_and_lang" :context="true" :key="$i18n.locale"/>
                </NuxtErrorBoundary>
            </div>
        </div>
        <NuxtErrorBoundary @error="body_error">
        <div class="article_content pt-1" ref="article_content">
            <section v-if="!welcome && data.body.pronunciation && data.body.pronunciation.length" class="pronunciation">
                <h4 :lang="locale2lang[content_locale]">{{$t('article.headings.pronunciation', 1, { locale: content_locale})}}</h4>

              <DefElement v-for="(element, index) in data.body.pronunciation" :semicolon="index == data.body.pronunciation.length-2" :comma="index < data.body.pronunciation.length-2" :dict="dict" :key="index" :body='element' v-on:link-click="link_click"/>

          </section>
          <section v-if="!welcome && data.body.etymology && data.body.etymology.length" class="etymology">
              <h4 :lang="locale2lang[content_locale]">{{$t('article.headings.etymology', 1, { locale: content_locale})}}</h4>
              <DefElement v-for="(element,index) in data.body.etymology" :semicolon="index == data.body.etymology.length-2" :comma="index < data.body.etymology.length-2" :dict="dict" :key="index" :body='element' v-on:link-click="link_click"/>

          </section>
          <section class="definitions" v-if="has_content && !welcome">
              <h4 :lang="locale2lang[content_locale]" v-if="!welcome">{{$t('article.headings.definitions', 1, { locale: content_locale})}}</h4>

              <Definition v-for="definition in data.body.definitions" :content_locale="content_locale" :dict="dict" :level="1" :key="definition.id" :body='definition' v-on:link-click="link_click" :welcome="welcome"/>

          </section>
          <section v-if="sub_articles.length && !welcome" class="expressions">
              <h4 :lang="locale2lang[content_locale]">{{$t('article.headings.expressions', 1, { locale: content_locale})}}</h4>
              <ul>
              <SubArticle class="p-2" v-for="(subart, index) in sub_articles" :body="subart" :dict="dict" :key="index" v-on:link-click="link_click" :content_locale="content_locale"/>
              </ul>
            </section>

          <div v-if="welcome">
            <WelcomeMarkdown :path="`/welcome/${dict}/${article_id}`">
              {{snippet}}
            </WelcomeMarkdown>
          </div>
      </div>
      </NuxtErrorBoundary>

  </div>
  
</div>
<div class="mx-1">
<ArticleFooter v-if="!welcome" :lemmas="data.lemmas" :content_locale="content_locale" :dict="dict" :article_id="article_id" />
        <div v-else class="text-right px-3 py-1 "><NuxtLink :to="link_to_self()">{{$t('article.show', 1, {locale: content_locale})}}</NuxtLink></div>
</div>
</div>
</template>

<script setup>
import { useSearchStore } from '~/stores/searchStore'
import { useI18n } from 'vue-i18n'
import {useSettingsStore } from '~/stores/settingsStore'
import {useSessionStore } from '~/stores/sessionStore'

const { t } = useI18n()
const i18n = useI18n()
const store = useSearchStore()
const inflection_expanded = ref(false)
const split_inf_expanded = ref(false)
const settings = useSettingsStore()
const route = useRoute()
const session = useSessionStore()

const props = defineProps({
    content_locale: String,
    article_id: Number,
    dict: String,
    welcome: Boolean,
    single: Boolean,
    list: Boolean
})


const { pending, data, error } = await useAsyncData('article_'+props.dict+props.article_id, () => $fetch(`${session.endpoint}${props.dict}/article/${props.article_id}.json`,
                                                                                        {
                                                                                            async onResponseError({ request, response, options }) {
                                                                                                // TODO: plausible logging, error message if article view
                                                                                                console.log("RESPONSE ERROR", response.status)
                                                                                            },
                                                                                            async onRequestError({ request, response, error }) {
                                                                                                // TODO: plausible logging, error message if article view
                                                                                                console.log("REQUEST ERROR", error)
                                                                                            }
                                                                                        }))


  if (route.name != 'welcome' && route.name != 'index' && route.name != 'search' && data.value)
  data.value.lemmas.forEach(lemma => {
      store.lemmas[props.dict].add(lemma.lemma)
      lemma.paradigm_info.forEach(paradigm => {
        paradigm.inflection.forEach(inflection => {
          if (inflection.tags[0] == "Inf") {
            store.lemmas[props.dict].add(inflection.word_form)
          }
        })

      })

})

const expand_inflection = () => {
  useTrackEvent('expand_inflection', {props: {article: props.dict + "/" + props.article_id}})
  inflection_expanded.value = !inflection_expanded.value
}


if (error.value && session.endpoint == "https://oda.uib.no/opal/prod/`") {
  session.endpoint = `https://odd.uib.no/opal/prod/`
  console.log("ERROR", error.value)
  refresh()
}

const body_error = (error) => {
  console.log("BODY_ERROR", error)
}

const inflection_error = (error) => {
  console.log("INFLECTION_ERROR", error)
}


const has_content = () => {
  for (const definition of data.value.body.definitions) {
      for (const element of definition.elements) {
        if (['explanation', 'example', 'compound_list', 'definition'].includes(element.type_)) {
          return true
        }
      }
    }
    return false
}

const inflected = computed(() => {
  return data.value.lemmas.reduce((acc, lemma) => acc += lemma.paradigm_info.reduce((acc2, digm) => digm.inflection_group.includes("uninfl") ? 0 : acc2 += digm.inflection.length, 0), 0) > data.value.lemmas.length

})

const lemmas_with_word_class_and_lang = computed(() => {
  return data.value.lemmas.map(lemma => Object.assign({language: props.dict == 'bm' ? 'nob' : 'nno',
                                                   word_class: lemma.paradigm_info[0].inflection_group.split('_')[0]}, lemma))
})


const find_sub_articles = (definition) => {
  let sub_art_list = []
try {
  let sub_definitions = definition.elements.filter(el => el.type_ == 'definition')
  let sub_articles = definition.elements.filter(el => el.type_ == 'sub_article' && el.lemmas)

    sub_definitions.forEach((subdef, i) => {
      sub_art_list = sub_art_list.concat(find_sub_articles(subdef))
    })
    sub_art_list = sub_art_list.concat(sub_articles)
return sub_art_list

}
catch(error) {
  console.log("find_sub_articles", props.article_id, props.dict,  '"'+error.message+'"')
  console.log(error)

  return []
}
}
const sub_articles = computed(() => {
  return data.value.body.definitions.reduce((acc, val) => acc.concat(find_sub_articles(val)), []).sort((s1, s2) => {   // Sort æ, ø and å correctly  
    let lemma1 = s1.lemmas[0].toLowerCase()
    let lemma2 = s2.lemmas[0].toLowerCase()
    let lettermap = {229: 299, 248: 298, 230: 297}

    for (var i = 0; i < Math.min(lemma1.length, lemma2.length); i++) {
      let charcode1 = lemma1.charCodeAt(i)
      let charcode2 = lemma2.charCodeAt(i)

      charcode1 = lettermap[charcode1] || charcode1
      charcode2 = lettermap[charcode2] || charcode2

      if (charcode1 != charcode2) {
        return charcode1 - charcode2
      }
    }
    return lemma1.length < lemma2.length || -1          

  })
})


const link_click = (event) => {
  console.log("ARTICLE CLICKED", event)
}

const link_to_self = () => {
  return `/${i18n.locale.value}/${props.dict}/${props.article_id}`
  }


const inflection_classes = (lemmas) => {
  let inf_classes = new Set()
  let ureg = false
  lemmas.forEach((lemma, i) => {
  if (lemma.inflection_class) inf_classes.add(lemma.inflection_class)
  else ureg = true
  })
  if (inf_classes.size){

  let class_array = Array.from(inf_classes).sort()
  if (ureg) class_array.push("ureg.")
  let class_list
  if (class_array.length < 3) {
  class_list = class_array.join(" og ")
  }
  else {
  class_list = class_array.slice(0, -1).join(", ") + " og " + class_array[class_array.length -1]
  }
  return " ("+ class_list +")"
  }
}

const lemma_groups = computed(() => {
  let groups = [{lemmas: data.value.lemmas}]
    try {
      if (data.value.lemmas[0].paradigm_info[0].tags[0] == "DET" && data.value.lemmas[0].paradigm_info[0].tags.length > 1) {
        groups = [{description: t('tags.' + data.value.lemmas[0].paradigm_info[0].tags[0], {locale: props.content_locale}), 
                   pos_group: ["Quant", "Dem", "Poss"].includes(data.value.lemmas[0].paradigm_info[0].tags[1]) ? 
                                                                t('determiner.' + data.value.lemmas[0].paradigm_info[0].tags[1], {locale: props.content_locale}) 
                                                                : '', 
                  lemmas: data.value.lemmas}]
      }
      else if (data.value.lemmas[0].paradigm_info[0].tags[0] == 'NOUN') {
          let genus_map  = {}
          data.value.lemmas.forEach(lemma =>{
            let genera = new Set()
            lemma.paradigm_info.forEach(paradigm => {
              if (paradigm.tags[1]) {
                genera.add(paradigm.tags[1])
              }
            })
            let genus_description = ""
            const sorted_genera = Array.from(genera).sort((g) => { return {Masc: 1, Fem: 2, Neuter: 3}[g]})
            console.log(sorted_genera, genera)
            if (sorted_genera.length == 3) {
              genus_description += t('three_genera', {m: t('tags.Masc'), f: t('tags.Fem', { locale: props.content_locale}), n: t('tags.Neuter', { locale: props.content_locale})})
            } else if (sorted_genera.length == 2) {
              console.log(t('tags.' + sorted_genera[0], 1, { locale: props.content_locale}))
              genus_description += t('two_genera', {a: t('tags.' + sorted_genera[0], { locale: props.content_locale}), b: t('tags.' + sorted_genera[1], { locale: props.content_locale})}) //Array.from(genera).map(code =>  t('tags.' + code, 1, { locale: props.content_locale})).sort().join(t('or'))
            }
            else if (sorted_genera.length == 1) {
              genus_description += t('tags.' + sorted_genera[0], 1, { locale: props.content_locale})
            }
            if (genus_map[genus_description]) {
              genus_map[genus_description].push(lemma)
            }
            else {
              genus_map[genus_description] = [lemma]
            }
          })
          groups = Object.keys(genus_map).map(key => {
            return {description:  t('tags.NOUN', 1, { locale: props.content_locale}), pos_group: key, lemmas: genus_map[key], }
          })


      }
      else if (data.value.lemmas[0].paradigm_info[0].tags[0] != 'EXPR') {
        let tag = data.value.lemmas[0].paradigm_info[0].tags[0] 
        if (tag) { // Workaround to prevent undefined tag if expression is without tag in the database
          groups = [{description:  t('tags.'+ tag, 1, { locale: props.content_locale}), lemmas: data.value.lemmas}]
        }
      }

      groups.forEach((lemma_group, index) => {
            groups[index]['inflection_classes'] = inflection_classes(lemma_group.lemmas)
          })
  } catch(error) {
    console.log("lemma_groups",props.article_id, props.dict, '"'+error.message+'"')
    console.log(error)
  }
    return groups


})

const secondary_header_text = computed(() => {
  let a_forms = []
    data.value.lemmas.forEach((lemma, i) => {
      if (lemma.paradigm_info[0] && lemma.paradigm_info[0].inflection[1] && lemma.paradigm_info[0].inflection[1].tags[0] == 'Inf') {
        let inf2 = lemma.paradigm_info[0].inflection[1].word_form
        if (inf2 && inf2.length) {
          a_forms.push(inf2)
        }
      }
    });
    return a_forms.join(', ')
})

const parse_subitems =  (explanation, text) => {
        let new_string = ""
        let old_parts = text.split(/(\$)/)
        let linkIndex = 0

        old_parts.forEach((item) => {
          if (item == '$') {
            let subitem = explanation.items[linkIndex]
            if (/^\d$/.test(subitem.text)) {
              if (subitem.type_ == "superscript") {
              new_string += "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(subitem.text)]
              }
              else if (subitem.type_ == "subscript") {
                new_string += "₀₁₂₃₄₅₆₇₈₉"[parseInt(subitem.text)]
              }
            }

              else if (subitem.id) {
                let expandable = session['concepts_'+props.dict][explanation.items[linkIndex].id]
                new_string += expandable ? expandable.expansion : " [...] "

            }
            else if (subitem.text) {
               if (subitem.text.includes('$')) {
                 new_string += parse_subitems(subitem, subitem.text)
               }
               else new_string += subitem.text
            }
            else  {
              if (explanation.items[linkIndex].lemmas) {
              new_string +=  explanation.items[linkIndex].word_form || explanation.items[linkIndex].lemmas[0].lemma
              }
            }
            linkIndex += 1
          }
          else {
            new_string += item
          }
        })
        return new_string

  }


const parse_definitions = (definition_list) => {
  let definitionTexts = []
    try {
    definition_list.forEach((definition) => {
      if (definition.elements) {
      if (definition.elements[0].content) {
        let new_string = parse_subitems(definition.elements[0], definition.elements[0].content)
        if (new_string.substring(new_string.length, new_string.length - 1) == ":" && definition.elements[1].quote) {
          new_string += " "+parse_subitems(definition.elements[1].quote, definition.elements[1].quote.content)
          
        }
        definitionTexts.push(new_string)

      }
      else if (definition.elements[0].elements) {
        definitionTexts.push(parse_definitions(definition.elements))
      }

      let subdefs = definition.elements.slice(1, definition.elements.length).filter(item => item.type_ == 'definition')

      if (subdefs.length) {
        definitionTexts.push(parse_definitions(subdefs))
      }

    }
    })
    } catch(error) {
      console.log("snippet", error.message)
      definitionTexts = []
    }

    let snippet = definitionTexts.filter(item => item).join("\u00A0•\u00A0")
    return snippet
  
}

const snippet = computed(() => {
if (data.value) {
  return parse_definitions(data.value.body.definitions)
}
else {
  console.log('No article body')
}

})

const title = computed(() => {
return data.value.lemmas[0].lemma
})


if (props.single) {
  useHead({
    title: title,
    meta: [
      {name: 'description', content: snippet },
      {property: 'og:title', content: title },
      {property: 'og:description', content: snippet },
      {name: 'twitter:description', content: snippet }  
    ],
    link: [
    {rel: "canonical", href: `https://ordbokene.no/${props.dict}/${route.params.article_id}`}
  ]
  });
}


</script>

<style scoped>

 h2 {
    font-variant-caps: all-small-caps;
    @apply !text-xl font-semibold tracking-widest mb-0 ml-4 !text-gray-700;
}




.inflection-container {
    /* box-shadow: 1px 1px 1px theme("colors.gray.500"); */
    /* box-shadow: 5px 5px 0px 0px #880E4F; */
    /* border-color: theme("colors.gray.500") !important; */
    /* border: solid 1px; */
    /* border-radius: 0rem; */
    @apply border-primary overflow-auto md:max-w-full inline-flex;
}

li:only-child.level1 > ol {
@apply pl-0;
}

ul li.definition {
@apply list-disc;
}



.level1>ol {
@apply pl-5;
}



section {
@apply py-2;
}


section.etymology > h4, section.pronunciation > h4 {
  @apply inline;
}

section.etymology ul, section.pronunciation ul, section.etymology li, section.pronunciation li {
@apply inline;
}


li.level1.definition {
list-style: upper-alpha;
}


li.level3.definition {
/* Norsk ordbok skal ha "lower.alpha" her */
@apply list-disc;
}

level2.definition {
/* Norsk ordbok skal ha "lower.alpha" her */
list-style: revert !important;
}

li.sub_article > ul {
@apply pl-0;
}

li::marker {
@apply text-primary font-bold;
}

li.level2>div {
@apply pl-2;
}

ol.sub_definitions {
@apply pl-5;
}



.skeleton {
  @apply ml-4 rounded-[1rem] bg-black;

}
.skeleton-heading {
  @apply h-8 w-60;
}

.skeleton-subheading {
  @apply h-5 w-40;
}

.skeleton-content {
  @apply h-4 m-4;
}

.skeleton-container {
  @apply h-[30rem]
}
.skeleton-indent {
  @apply ml-8;
}

span.lemma {
  @apply text-primary;
}

span.lemma-group {
  @apply font-semibold;
}


.article {
    /* border: 1px solid #560027; */
    @apply p-1 md:p-2 lg:p-4 bg-canvas shadow-md rounded-[2rem]; 
  
}
  



.list-view-item {
@apply flex;

}


.list-view-item>a {
  @apply duration-200 motion-reduce:transition-none py-2 px-4 text-ellipsis w-full border-0 inline-block overflow-hidden border-none; 

}

@media screen(lg) {
.list-view-item>a {
  @apply whitespace-nowrap;
}
}


.list-view-item>a:hover {
    @apply duration-200 bg-canvas-darken border-2;
    
}

.article-column>li .result-list-item {
border-bottom: solid 1px theme('colors.gray.100') ;
}




.article-column>li:last-child .result-list-item {
border-bottom: none;
}



</style>
