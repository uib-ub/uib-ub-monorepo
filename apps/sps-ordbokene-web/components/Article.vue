<template>
    <div class="list-view-item" v-if="listView">
        <span v-if="pending" class="list-view-item"><div class="skeleton skeleton-content w-25"/><div class="skeleton skeleton-content w-50"/></span>
        <NuxtLink v-else class="result-list-item" :to="link_to_self()">

    <div v-for="(lemma_group, i) in lemma_groups" :key="i">
    <span class="lemma-group">

    <span v-for="(lemma, index) in lemma_group.lemmas"
          :key="index"><span class="lemma"><DefElement v-if="lemma.annotated_lemma" :body="lemma.annotated_lemma" tag="span" :content_locale="content_locale"/><span v-else>{{lemma.lemma}}</span></span>
          <span v-if="lemma.hgno"
                   :aria-label="$t('accessibility.homograph') + parseInt(lemma.hgno)"
                   :title="$t('accessibility.homograph')+parseInt(lemma.hgno)"
                   class="hgno">{{" "+roman_hgno(lemma)}}</span>
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
    <div class="article lg:pt-1" v-else-if="!error">
        <div v-if="pending" class="skeleton-container">
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
          
        <h2 v-if="welcome" class="dict-label">{{$t('monthly', 1, { locale: content_locale}) + {"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[dict]}}</h2>
        <h2 v-else-if="single" class="article-dict-label">{{{"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[dict]}}</h2>
        <h2 v-else class="dict-label lg:hidden d-block">{{{"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[dict]}}</h2>
        
        <div :class="welcome? 'px-4 pb-6 pt-4' : 'px-4 pt-4 pb-2'">

        <ArticleHeader :lemma_groups="lemma_groups" :secondary_header_text="secondary_header_text" :content_locale="content_locale" :dict="dict"/>
      
      <button v-if="!settings.inflectionExpanded && inflected && !welcome" class="btn btn-primary my-1 !pr-2" @click="inflection_expanded = !inflection_expanded" type="button" :aria-expanded="inflection_expanded" :aria-controls="inflection_expanded ? 'inflection-'+article_id : null">
             {{$t('article.show_inflection')}}<span v-if="!inflection_expanded"><Icon name="bi:plus" class="text-primary ml-4" size="1.5rem"/></span><span v-if="inflection_expanded"><Icon name="bi:dash" class="text-primary ml-4" size="1.5rem"/></span>
      </button>
        <div v-if="inflected && !welcome && (inflection_expanded || settings.inflectionExpanded)" class="border-collapse py-2 transition-all duration-300 ease-in-out" :id="'inflection-'+article_id" ref="inflection_table">
            <div class="inflection-container p-2">
                <NuxtErrorBoundary @error="inflection_error">
                <InflectionTable :class="store.dict == 'bm,nn' ? 'xl:hidden' : 'sm:hidden'" mq="xs" :eng="$i18n.locale == 'eng'" :lemmaList="lemmas_with_word_class_and_lang" :context="true" :key="$i18n.locale"/>
                <InflectionTable :class="store.dict == 'bm,nn' ? 'hidden xl:flex' : 'hidden sm:flex'" mq="sm" :eng="$i18n.locale == 'eng'" :lemmaList="lemmas_with_word_class_and_lang" :context="true" :key="$i18n.locale"/>
                </NuxtErrorBoundary>
            </div>
        </div>
        <NuxtErrorBoundary @error="body_error">
        <div class="article_content pt-1" ref="article_content">
            <section v-if="!welcome && data.body.pronunciation && data.body.pronunciation.length" class="pronunciation">
                <h4>{{$t('article.headings.pronunciation', 1, { locale: content_locale})}}</h4>

                <DefElement v-for="(element, index) in data.body.pronunciation" :dict="dict" :key="index" :body='element' v-on:link-click="link_click"/>

            </section>
            <section v-if="!welcome && data.body.etymology && data.body.etymology.length" class="etymology">
                <h4>{{$t('article.headings.etymology', 1, { locale: content_locale})}}</h4>

                <DefElement v-for="(element, index) in data.body.etymology" :dict="dict" :key="index" :body='element' v-on:link-click="link_click"/>

            </section>
            <section class="definitions" v-if="has_content">
                <h4 v-if="!welcome">{{$t('article.headings.definitions', 1, { locale: content_locale})}}</h4>

                <Definition v-for="definition in data.body.definitions" :content_locale="content_locale" :dict="dict" :level="1" :key="definition.id" :body='definition' v-on:link-click="link_click" :welcome="welcome"/>

            </section>
            <section v-if="sub_articles.length && !welcome" class="expressions">
                <h4>{{$t('article.headings.expressions', 1, { locale: content_locale})}}</h4>
                <ul>
                <SubArticle v-for="(subart, idx) in sub_articles" :body="subart" :dict="dict" :key="idx" v-on:link-click="link_click" :content_locale="content_locale"/>
                </ul>
              </section>
        </div>
        </NuxtErrorBoundary>
        <ArticleFooter v-if="!welcome" :lemmas="data.lemmas" :content_locale="content_locale" :dict="dict" :article_id="article_id" />

        
    </div>
</div>
</div>
</template>

<script setup>
import { useStore } from '~/stores/searchStore'
import { useI18n } from 'vue-i18n'
import {useSettingsStore } from '~/stores/settingsStore'

const { t } = useI18n()
const i18n = useI18n()
const store = useStore()
const inflection_expanded = ref(false)
const settings = useSettingsStore()
const route = useRoute()

const props = defineProps({
    article_id: Number,
    dict: String,
    welcome: Boolean,
    single: Boolean
})

const listView = computed(() => {
  return store.q && !single &&  (store.advanced ? settings.listView && route.name == 'search' : settings.simpleListView && route.name == 'word')
})

const { pending, data, error } = useAsyncData('article_'+props.dict+props.article_id, () => $fetch(`${store.endpoint}${props.dict}/article/${props.article_id}.json`,
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

const body_error = (error) => {
    console.log("BODY_ERROR", error)
}

const inflection_error = (error) => {
    console.log("INFLECTION_ERROR", error)
}

const content_locale = computed(() => {
    return i18n.locale == 'eng' ? 'eng' : {bm: 'nob', nn: 'nno'}[props.dict]
})


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

    return []
  }
}
const sub_articles = computed(() => {
    return data.value.body.definitions.reduce((acc, val) => acc.concat(find_sub_articles(val)), []).sort((s1, s2) => {   // Sort æ, ø and å correctly  
      let lemma1 = s1.lemmas[0].toLowerCase()
      let lemma2 = s1.lemmas[0].toLowerCase()
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
      return lemma1.lenght < lemma2.length || -1          

    })
})


const link_click = (event) => {
    console.log("ARTICLE CLICKED", event)
}

const link_to_self = () => {
    return `/${props.dict}/${props.article_id}`
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
          groups = [{description: t('tags.'+data.value.lemmas[0].paradigm_info[0].tags[0], {locale: content_locale}), 
                     pos_group: ["Quant", "Dem", "Poss"].includes(data.value.lemmas[0].paradigm_info[0].tags[1]) ? 
                                                                  t('determiner.' + data.value.lemmas[0].paradigm_info[0].tags[1], {locale: content_locale}) 
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
              if (genera.size == 3) {
                genus_description +=  t('tags.Masc') + ', ' +  t('tags.Fem', 1, { locale: content_locale}) +  t('or') +  t('tags.Neuter', 1, { locale: content_locale})
              } else {
                genus_description += Array.from(genera).map(code =>  t('tags.'+code, 1, { locale: content_locale})).sort().join(t('or'))
              }
              if (genus_map[genus_description]) {
                genus_map[genus_description].push(lemma)
              }
              else {
                genus_map[genus_description] = [lemma]
              }
            })
            groups = Object.keys(genus_map).map(key => {
              return {description:  t('tags.NOUN', 1, { locale: content_locale}), pos_group: key, lemmas: genus_map[key], }
            })


        }
        else if (data.value.lemmas[0].paradigm_info[0].tags[0] != 'EXPR') {
          groups = [{description:  t('tags.'+data.value.lemmas[0].paradigm_info[0].tags[0], 1, { locale: content_locale}), lemmas: data.value.lemmas}]
        }

        groups.forEach((lemma_group, index) => {
              groups[index]['inflection_classes'] = inflection_classes(lemma_group.lemmas)
            })
    } catch(error) {
      console.log("lemma_groups",props.article_id, props.dict, '"'+error.message+'"')
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
                let expandable = store['concepts_'+props.dict][explanation.items[linkIndex].id]
                if (!expandable) {
                    console.log(subitem)
                    console.log(store.concepts_bm)
                }
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


const parse_definitions = (node) => {
    let definitionTexts = []
      try {
      node.forEach((definition) => {
        if (definition.elements) {
        if (definition.elements[0].content) {
          let new_string = parse_subitems(definition.elements[0], definition.elements[0].content)
          if (new_string.substring(new_string.length, new_string.length - 1) == ":") {
            new_string = new_string.slice(0, -1)
          }
          definitionTexts.push(new_string)

        }
        else if (definition.elements[0].elements) {
          definitionTexts.push(parse_definitions(definition.elements))
        }
      }
      })
      } catch(error) {
        console.log("snippet", error.message)
        definitionTexts = []
      }

      let snippet = definitionTexts.join("\u00A0•\u00A0")
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
    {rel: "canonical", href: `https://ordbokene.no/${props.dict}/${route.params.slug[0]}`}
  ]
  });
}


</script>

<style scoped>

 h2 {
    color: theme("colors.gray.700") !important;
    margin-left: 1rem;
    margin-bottom: 0rem;
    letter-spacing: .1rem;
    font-variant-caps: all-small-caps;
    font-weight: 600;
    font-size: 1.25rem !important;
}




.inflection-container {
    box-shadow: 1px 1px 1px theme("colors.gray.500");
    border-color: theme("colors.gray.500") !important;
    border: solid 1px;
    border-radius: 1.5rem;
    display: inline-flex;

    

    @apply border-primary overflow-auto;
}

ol > li:only-child.level1, li:only-child.level2 {
  /* level3 a.k.a. underdefinisjoner skal vises med bullet selv om de står alene */
  /* list-style: none;*/
  color: blue;
}

li:only-child.level1 > ol {
  padding-left: 0px;
}

ul, ol {
  padding-left: 12px !important;
}

ul li

ul li.definition {
  list-style: disc;
}

h4 {
  font-size: 1.5rem;
  @apply text-primary;
  font-variant: all-small-caps;
  font-weight: 600;
  padding-right: 1rem;

}

.article-dict-label {
    font-size: 1.5rem !important;
    padding-bottom: 1rem;
}



.skeleton {
    background-color: rgba(0,0,0, .1);
    border-radius: 1rem;
    margin-left: 1rem;

}
.skeleton-heading {
    height: 2rem;
    width: 15rem;
}

.skeleton-subheading {
    height: 1.25rem;
    width: 10rem;
}

.skeleton-content {
    height: 1rem;
    margin: 1rem;
}

.skeleton-container {
    height: 30rem;
}
.skeleton-indent {
    margin-left: 2rem;
}

span.lemma {
    @apply text-primary;
}

span.lemma-group {
    font-weight: 600;
}


.article {
    border-radius: 2rem;
    border: solid 1px;
    box-shadow: 2px 2px 0px theme("colors.gray.100");
    
    @apply p-1 mb-2 md:mb-4 md:p-2 lg:p-3 bg-canvas border-gray-100;

    


}

.article .dict_label {
    @apply text-text
    }




.list-view-item {
  display: flex;
}


.list-view-item>a {
    padding-bottom: 0.6rem;
    padding-top: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    
    border: none;
    display: inline-block;
    width: 100%;

}

@media screen(lg) {
  .list-view-item>a {
    white-space: nowrap;
  }
}


.list-view-item>a:hover {
    background-color:theme('colors.gray.100');
}

.article-column>li .result-list-item {
  border-bottom: solid 1px theme('colors.gray.200') ;
}




.article-column>li:last-child .result-list-item {
  border-bottom: none;
}



</style>
