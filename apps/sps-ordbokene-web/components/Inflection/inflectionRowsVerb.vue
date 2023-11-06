<template>
  <tr class="infl-row">
    <template v-if="tags.tags">
      <th :id="tags.label + lemmaId"
          class="infl-label xs"
          scope="row">
        {{tags.label? $t('infl_table_tags.' + tags.label, 1, {locale}) : ''}}
      </th>
      <td v-for="([prefix, [rowspan,rowindex,forms], suffix], index) in cells"
          :key="index"
          class="notranslate infl-cell"
          :colspan="rowspan"
          :headers="(tags.block ? tags.block + lemmaId : '') + ' ' + (tags.label ? tags.label + lemmaId : '')"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span v-for="(form, index2) in forms"
              :key="index2"
              class='comma'>
          <em v-if="prefix" class="context">{{prefix}}</em>
          {{form}}<span v-if="suffix!='!'"> </span><em v-if="suffix" translate="yes" :lang="langTag" class="context nobr">{{suffix}}</em>
        </span>
      </td>
    </template>
    <template v-else>
      <th :id="tags.title"
           class="infl-group"
           scope="col"
           :lang="langTag"
           :colspan="paradigms.length+1">
        {{tags.title? $t('infl_table_tags.' + tags.title, 1, {locale}) : ''}}
      </th>
    </template>
  </tr>
</template>

<script>



import { inflectedForm, tagToName
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsVerb',
    props: ['paradigms','tags', 'dict', 'locale', 'langTag', 'lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: !this.tags.title ?
                this.paradigms.map(
                    p => this.inflForm(p,
                                        this.tags.tags,
                                        this.tags.excl,
                                        this.tags.prefix,
                                        this.tags.suffix))
                .filter(r => r) :
            []
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (paradigm, tagList, exclTagList, prefix, suffix) {
            const forms = inflectedForm(paradigm, tagList, exclTagList)
            if (forms) {
                return [prefix, forms, suffix]
            } else {
                return null
            }
        },
        tagToName: function (tag) {
            return tagToName(tag, this.locale) || tag
        }
    }
}
</script>