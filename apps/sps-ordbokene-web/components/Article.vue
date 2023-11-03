<template>
  <div  v-if="error && single"><ErrorMessage :error="error" :title="$t('error.article', {dict: $t('dicts_inline.' + dict ), article_id})"/></div>
  <div v-else :class="list && 'list-view-item flex-col' || 'article flex flex-col'">
  <div v-if="list && !welcome"  :lang="dictLang[dict]">
    <button class="list-view-button !flex !gap-4 px-4 justify-start !py-2 text-lg truncate w-full" 
            :href="link_to_self()" 
            :aria-expanded="expanded"
            :aria-controls="expanded ? `${dict}_${article_id}_snippet` : undefined"
            @click="expanded = !expanded">
      <span class="self-center"><Icon :name="expanded ? 'bi:chevron-up' : 'bi:chevron-down'" size = "1.25rem"/></span>
      <span class="flex flex-col  overflow-hidden">
        <span class="flex">
      <span v-for="(lemma_group, i) in lemma_groups" :key="i" class="block">
      <span class="lemma-group">
        <span v-for="(lemma, index) in lemma_group.lemmas.slice(0, 1)"
              :key="index"
              class="whitespace-nowrap"><span class="lemma"><DefElement v-if="lemma.annotated_lemma" :body="lemma.annotated_lemma" tag="span" :scoped_locale="scoped_locale"/><span v-else>{{lemma.lemma}}</span></span>
              <span v-if="lemma.hgno" class="hgno">{{"\xa0"}}<span class="sr-only">{{parseInt(lemma.hgno)}}</span><span aria-hidden="true">{{roman_hgno(lemma)}}</span></span>
        </span>
    </span>
    <span v-if="secondary_header_text">,&nbsp;<span class="lemma-group text-primary">{{secondary_header_text}}</span></span>
      &nbsp;<span v-if="lemma_group.description" class="subheader" :lang="scoped_lang">
      <span class="header-group-list text-2xl">{{lemma_group.description}}</span>
            
      <span v-if="settings.inflectionNo" class="inflection_classes">{{lemma_group.inflection_classes}}</span>
      </span>
      </span>
      
        </span>
    <span :id="`${dict}_${article_id}_snippet`" class="text-start truncate ">{{snippet}}</span>
    </span> 
    
    </button>
</div>
<div v-if="!list || expanded" :id="`${dict}_${article_id}_body`" :lang="dictLang[dict]" class="flex flex-col grow" :class="{'expanded-article': list}">
      <div>
        <h2 v-if="welcome" :class="{'!text-base': $i18n.locale == 'ukr'}" class="dict-label">{{$t('monthly', {dict: $t('dicts_inline.' + dict)}, { locale: scoped_locale})}}</h2>
        <h2 v-else-if="single" class="dict-label">{{{"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[dict]}}</h2>
        <div class="px-4 pt-4 pb-2" :class="{'pb-3' : welcome,  '!py-0 !px-3': list}">

        <ArticleHeader :lemma_groups="lemma_groups" :secondary_header_text="secondary_header_text" :scoped_locale="scoped_locale" :dict="dict" :article_id="article_id"/>
      
      <div v-if="data.lemmas[0].split_inf" class="mt-2 mb-3">
        <div class="flex gap-2 align-middle"><span :id="`${dict}_${article_id}_split_inf_label`">{{$t('split_inf.title')}}: -a</span>
        <button type="button" class="rounded leading-none !p-0 !text-primary hover:bg-primary-lighten bg-primary  border-primary-lighten" :aria-expanded="split_inf_expanded" :aria-label="`${dict}_${article_id}_split_inf_label`" aria-controls="split-inf-explanation" @click="split_inf_expanded = !split_inf_expanded">
          <Icon :name="split_inf_expanded? 'bi:dash' : 'bi:plus'" class="text-white !m-0 !p-0" size="1.5em"/>
        </button>
        </div>
        
        <div v-if="split_inf_expanded" id="split-inf-explanation" class="mb-4 my-2">
          {{$t('split_inf.content[0]', scoped_locale)}} <em>-a</em> {{$t('split_inf.content[1]', scoped_locale)}}
          <a target="_blank" 
             href="https://www.sprakradet.no/svardatabase/sporsmal-og-svar/kloyvd-infinitiv-/">{{$t('split_inf.content[2]', scoped_locale)}}</a>
        </div>
        </div>

      <button type="button" v-if="inflected && !welcome && !single && !list" 
              class="btn btn-primary my-1 border-primary-darken !pr-2" 
              :aria-expanded="inflection_expanded" 
              :aria-controls="inflection_expanded ? `${dict}_${article_id}_inflection` : null"
              :lang="scoped_lang"
              @click="expand_inflection">
             {{ $t(inflection_expanded ? 'article.hide_inflection' : 'article.show_inflection', 1, {locale: scoped_locale})}}<span v-if="!inflection_expanded"><Icon name="bi:chevron-down" class="ml-4" size="1.25em"/></span><span v-if="inflection_expanded"><Icon name="bi:chevron-up" class="ml-4" size="1.5em"/></span>
      </button>
        <div v-if="inflected && !welcome && (inflection_expanded || single || list)" :id="`${dict}_${article_id}_inflection`" ref="inflection_table" class="motion-reduce:transition-none border-collapse py-2 transition-all duration-300 ease-in-out">
            <div class="overflow-x-auto p-2">
                <client-only>
                  <InflectionTable :scoped_locale="scoped_locale" :mq="inflection_size()" :eng="$i18n.locale == 'eng'" :ukr="$i18n.locale == 'ukr'" :lemma-list="lemmas_with_word_class_and_lang"  :context="true" :dict="dict" :article_id="article_id"/>
                  <template #fallback>
                    <InflectionTable v-if="single" :key="$i18n.locale" :scoped_locale="scoped_locale" mq="sm" :eng="$i18n.locale == 'eng'" :ukr="$i18n.locale == 'ukr'" :lemma-list="lemmas_with_word_class_and_lang"  :context="true" :dict="dict" :article_id="article_id"/>
                  </template>
                </client-only>
     
            </div>
        </div>
        <div ref="article_content" class="article_content pt-1">
            <section v-if="!welcome && data.body.pronunciation && data.body.pronunciation.length" class="pronunciation">
                <h4 :lang="locale2lang[scoped_locale]">{{$t('article.headings.pronunciation', 1, { locale: scoped_locale})}}</h4>

              <DefElement v-for="(element, index) in data.body.pronunciation" :semicolon="index == data.body.pronunciation.length-2" :comma="index < data.body.pronunciation.length-2" :dict="dict" :key="index" :body='element' v-on:link-click="link_click"/>

          </section>
          <section v-if="!welcome && data.body.etymology && data.body.etymology.length" class="etymology">
              <h4 :lang="locale2lang[scoped_locale]">{{$t('article.headings.etymology', 1, { locale: scoped_locale})}}</h4>
              <DefElement v-for="(element,index) in data.body.etymology" :semicolon="index == data.body.etymology.length-2" :comma="index < data.body.etymology.length-2" :dict="dict" :key="index" :body='element' v-on:link-click="link_click"/>

          </section>
          <section v-if="has_content && !welcome" class="definitions">
              <h4 v-if="!welcome" :lang="locale2lang[scoped_locale]">{{$t('article.headings.definitions', 1, { locale: scoped_locale})}}</h4>

              <Definition v-for="definition in data.body.definitions" :key="definition.id" :scoped_locale="scoped_locale" :dict="dict" :level="1" :body='definition' :welcome="welcome" @link-click="link_click"/>

          </section>
          <section v-if="sub_articles.length && !welcome" class="expressions">
              <h4 :lang="locale2lang[scoped_locale]">{{$t('article.headings.expressions', 1, { locale: scoped_locale})}}</h4>
              <ul>
              <SubArticle v-for="(subart, index) in sub_articles" :key="index" class="p-2"  :body="subart" :dict="dict" :scoped_locale="scoped_locale" @link-click="link_click" />
              </ul>
            </section>

          <div v-if="welcome">
            <WelcomeMarkdown :path="`/welcome/${dict}/${article_id}`">
              {{snippet}}
            </WelcomeMarkdown>
          </div>
      </div>
  </div>
  
</div>
<div class="mx-1 flex-1 flex items-end justify-end" :class="{'!justify-start': single}">
<ArticleFooter v-if="!welcome" :lemmas="data.lemmas" :scoped_locale="scoped_locale" :dict="dict" :article_id="article_id" />
        <div v-else class="text-right px-3 py-1"><NuxtLink :to="link_to_self()">{{$t('article.show', 1, {locale: scoped_locale})}}</NuxtLink></div>
</div>
</div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '~/stores/searchStore'
import {useSettingsStore } from '~/stores/settingsStore'
import {useSessionStore } from '~/stores/sessionStore'

const { t } = useI18n()
const i18n = useI18n()
const store = useSearchStore()
const split_inf_expanded = ref(false)
const settings = useSettingsStore()
const route = useRoute()
const session = useSessionStore()
const expanded = ref(false)
const inflection_expanded = ref(settings.inflectionExpanded || false)


const props = defineProps({
    scoped_locale: {type: String, required: true},
    article_id:  {type: Number, required: true},
    dict:  {type: String, required: true},
    welcome: Boolean,
    single: Boolean,
    list: Boolean
})



const { pending, data, error } = await useAsyncData('article_' + props.dict + props.article_id, () => $fetch(`${session.endpoint}${props.dict}/article/${props.article_id}.json`))


if (route.name != 'welcome' && route.name !== 'index' && route.name !== 'search' && data.value)
  data.value.lemmas.forEach(lemma => {
      store.lemmas[props.dict].add(lemma.lemma)
      lemma.paradigm_info.forEach(paradigm => {
        paradigm.inflection.forEach(inflection => {
          if (inflection.tags[0] === "Inf") {
            store.lemmas[props.dict].add(inflection.word_form)
          }
        })

      })
})


const expand_inflection = () => {
  useTrackEvent('expand_inflection', {props: {article: props.dict + "/" + props.article_id}})
  inflection_expanded.value = !inflection_expanded.value
}


if (error.value && session.endpoint === "https://oda.uib.no/opal/prod/`") {
  session.endpoint = `https://odd.uib.no/opal/prod/`
  console.log("ERROR", error.value)
  refresh()
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
  return data.value.lemmas.map(lemma => Object.assign({language: props.dict === 'bm' ? 'nob' : 'nno',
                                                   word_class: lemma.paradigm_info[0].inflection_group.split('_')[0]}, lemma))
})


const find_sub_articles = (definition) => {
  let sub_art_list = []
try {
  const sub_definitions = definition.elements.filter(el => el.type_ === 'definition')
  const sub_articles = definition.elements.filter(el => el.type_ === 'sub_article' && el.lemmas)

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
    const lemma1 = s1.lemmas[0].toLowerCase()
    const lemma2 = s2.lemmas[0].toLowerCase()
    const lettermap = {229: 299, 248: 298, 230: 297}

    for (let i = 0; i < Math.min(lemma1.length, lemma2.length); i++) {
      let charcode1 = lemma1.charCodeAt(i)
      let charcode2 = lemma2.charCodeAt(i)

      charcode1 = lettermap[charcode1] || charcode1
      charcode2 = lettermap[charcode2] || charcode2

      if (charcode1 !== charcode2) {
        return charcode1 - charcode2
      }
    }
    return lemma1.length < lemma2.length || -1          

  })
})


const link_click = (itemref) => {
  useTrackEvent('article_clicked', {props: {combined: props.dict + "/" + props.article_id, to: itemref, combined: props.dict + "/" + props.article_id + " => " + itemref}})
}

const link_to_self = () => {
  return `/${i18n.locale.value}/${props.dict}/${props.article_id}`
  }

const inflection_size = () => {
    if (store.dict === 'bm,nn' ) {
      return window.matchMedia('(min-width: 1280px)').matches ? 'sm' : 'xs'
    }
    else {
      return window.matchMedia('(min-width: 1024px)').matches ? 'sm' : 'xs'
    }
}

const inflection_classes = (lemmas) => {
  const inf_classes = new Set()
  let ureg = false
  lemmas.forEach((lemma, i) => {
  if (lemma.inflection_class) inf_classes.add(lemma.inflection_class)
  else ureg = true
  })
  if (inf_classes.size){

  const class_array = Array.from(inf_classes).sort()
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
      if (data.value.lemmas[0].paradigm_info[0].tags[0] === "DET" && data.value.lemmas[0].paradigm_info[0].tags.length > 1) {
        groups = [{description: t('tags.' + data.value.lemmas[0].paradigm_info[0].tags[0], {locale: props.scoped_locale}), 
                   pos_group: ["Quant", "Dem", "Poss"].includes(data.value.lemmas[0].paradigm_info[0].tags[1]) ? 
                                                                t('determiner.' + data.value.lemmas[0].paradigm_info[0].tags[1], {locale: props.scoped_locale}) 
                                                                : '', 
                  lemmas: data.value.lemmas}]
      }
      else if (data.value.lemmas[0].paradigm_info[0].tags[0] === 'NOUN') {
          const genus_map  = {}
          data.value.lemmas.forEach(lemma =>{
            const genera = new Set()
            lemma.paradigm_info.forEach(paradigm => {
              if (paradigm.tags[1]) {
                genera.add(paradigm.tags[1])
              }
            })
            let genus_description = ""
            const sorted_genera = Array.from(genera).sort((g) => { return {Masc: 1, Fem: 2, Neuter: 3}[g]})
            if (sorted_genera.length === 3) {
              genus_description += t('three_genera', {m: t('tags.Masc'), f: t('tags.Fem', { locale: props.scoped_locale}), n: t('tags.Neuter', { locale: props.scoped_locale})})
            } else if (sorted_genera.length === 2) {
              genus_description += t('two_genera', {a: t('tags.' + sorted_genera[0], { locale: props.scoped_locale}), b: t('tags.' + sorted_genera[1], { locale: props.scoped_locale})}) // Array.from(genera).map(code =>  t('tags.' + code, 1, { locale: props.scoped_locale})).sort().join(t('or'))
            }
            else if (sorted_genera.length === 1) {
              genus_description += t('tags.' + sorted_genera[0], 1, { locale: props.scoped_locale})
            }
            if (genus_map[genus_description]) {
              genus_map[genus_description].push(lemma)
            }
            else {
              genus_map[genus_description] = [lemma]
            }
          })
          groups = Object.keys(genus_map).map(key => {
            return {description:  t('tags.NOUN', 1, { locale: props.scoped_locale}), pos_group: key, lemmas: genus_map[key], }
          })


      }
      else if (data.value.lemmas[0].paradigm_info[0].tags[0] !== 'EXPR') {
        let tag = data.value.lemmas[0].paradigm_info[0].tags[0] 
        if (tag) { // Workaround to prevent undefined tag if expression is without tag in the database
          groups = [{description:  t('tags.'+ tag, 1, { locale: props.scoped_locale}), lemmas: data.value.lemmas}]
        }
      }

      groups.forEach((lemma_group, index) => {
            groups[index].inflection_classes = inflection_classes(lemma_group.lemmas)
          })
  } catch(error) {
    console.log("lemma_groups",props.article_id, props.dict, '"'+error.message+'"')
    console.log(error)
  }
    return groups


})

const secondary_header_text = computed(() => {
  const a_forms = []
    data.value.lemmas.forEach((lemma, i) => {
      if (lemma.paradigm_info[0] && lemma.paradigm_info[0].inflection[1] && lemma.paradigm_info[0].inflection[1].tags[0] === 'Inf') {
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
        const old_parts = text.split(/(\$)/)
        let linkIndex = 0

        old_parts.forEach((item) => {
          if (item === '$') {
            const subitem = explanation.items[linkIndex]
            if (/^\d$/.test(subitem.text)) {
              if (subitem.type_ === "superscript") {
              new_string += "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(subitem.text)]
              }
              else if (subitem.type_ === "subscript") {
                new_string += "₀₁₂₃₄₅₆₇₈₉"[parseInt(subitem.text)]
              }
            }

              else if (subitem.id) {
                const expandable = session['concepts_'+props.dict][explanation.items[linkIndex].id]
                new_string += expandable ? expandable.expansion : " [...] "

            }
            else if (subitem.text) {
               if (subitem.text.includes('$')) {
                 new_string += parse_subitems(subitem, subitem.text)
               }
               else new_string += subitem.text
            }
            else if (explanation.items[linkIndex].lemmas) {
              new_string +=  explanation.items[linkIndex].word_form || explanation.items[linkIndex].lemmas[0].lemma
              }
            
            linkIndex += 1
          }
          else {
            new_string += item
          }
        })
        return new_string

  }


const parse_definitions = (definition_list, shorten) => {
  let definitionTexts = []
    try {
    definition_list.forEach((definition) => {
      if (definition.elements) {
        for (let i = 0; i < definition.elements.length; i++) {
          const item = definition.elements[i]

          if (item.content) {
              const new_string = parse_subitems(item, item.content)

              if (!shorten || new_string.length && new_string[new_string.length -1] !== ":") { // prevent
                definitionTexts.push(new_string)
              }
            }
          else if (item.elements && item.type_ !== 'definition' && !shorten) {
            definitionTexts.push(parse_definitions(item.elements, shorten))
          }
          else if (item.quote && !shorten ) { 
            const prev = definitionTexts[definitionTexts.length-1]
            if (prev && prev[prev.length -1] === ":") {
              definitionTexts[definitionTexts.length -1] += (" " + parse_subitems(item.quote, item.quote.content))

            }
            else if (definition.elements[i-1] && definition.elements[i-1].quote ) {

                definitionTexts[definitionTexts.length -1] += ("; " + parse_subitems(item.quote, item.quote.content))
              
            }
            else {
              definitionTexts[definitionTexts.length -1] += (".\u00A0" + {bm: "Eksempel: ", nn: "Døme: "}[props.dict] + parse_subitems(item.quote, item.quote.content))
            }
          }

        }
        const subdefs = definition.elements.slice(1, definition.elements.length).filter(item => item.type_ == 'definition')
        if (subdefs.length) {
          definitionTexts.push(parse_definitions(subdefs, shorten))
        }
    }
    })
    } catch(error) {      
      useTrackEvent("snippet_error", {article: props.dict + "/" + props.article_id, props: {message: props.dict + "/" + props.article_id + ": " + error.toString()}})
      definitionTexts = []
    }

    const snippet = definitionTexts.filter(item => item).join(";\u00A0")
    return snippet
  
}

const snippet = computed(() => {
  
  if (data.value) {
    const shorten =  data.value.body.definitions[0] && data.value.body.definitions[0].elements.length > 5   
    return parse_definitions(data.value.body.definitions, shorten)
  }
  else {
    useTrackEvent("snippet_error", {article: props.dict + "/" + props.article_id, props: {message: props.dict + "/" + props.article_id + ": No article body"}})
    return ""
  }

})


const scoped_lang = computed(() => {
  return locale2lang[props.scoped_locale]
})


const metaSnippet = computed(() => {
  return lemma_groups.value.map(item => item.description + " — ") + snippet.value
})

const title = computed(() => {
return data.value.lemmas[0].lemma
})


if (props.single && data.value) {
  useHead({
    title,
    meta: [
      {name: 'description', content: metaSnippet },
      {name: 'twitter:title', content: title },
      {name: 'twitter:description', content: metaSnippet },
      {property: 'og:title', content: title },
      {property: 'og:description', content: metaSnippet },
    ],
    link: [ 
      {rel: 'canonical', href: `https://ordbokene.no/${props.dict}/${props.article_id}` } // TODO: remove when we replace the old site
    ]
  });
}


</script>

<style scoped>

 h2 {
    font-variant-caps: all-small-caps;
    @apply font-semibold tracking-widest mb-0 ml-4 !text-gray-700;
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
  


.list-item-header {
  @apply duration-200 motion-reduce:transition-none py-2 px-4 text-ellipsis border-0 border-none lg:whitespace-nowrap lg:!no-underline; 

}


.list-view-button[aria-expanded=false], .expanded-article {
  border-bottom: solid 1px theme('colors.gray.400') ;
}

.list-view-button:hover {
    @apply  bg-canvas-darken;
}

.list-view-button[aria-expanded=true] {
    @apply  bg-gray-50 !text-black;
}



.article-column>li:last-child .list-view-button {
border-bottom: none;
}

.expanded-article {
  @apply article !shadow-none !py-4 md:!py-8;
  border-radius: 0px;

}



</style>
