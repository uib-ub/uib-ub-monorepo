<template>
  <tr class="infl-row">
    <template v-if="tags.tags && cells.length">
      <th class="infl-label xs"
          :id="tags.label"
          scope="row">
        {{tagToName(tags.label)}}
      </th>
      <td v-for="([rowspan,rowindex,forms], index) in cells"
          :key="index"
          class="notranslate infl-cell xs"
          :colspan="rowspan"
          :index="rowindex"
          :headers="tags.block + ' ' + (tags.label || '')"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span v-for="(form, index2) in forms"
              :key="index2"
              class='comma'>{{form}}</span>
      </td>
    </template>
    <template v-if="tags.title">
      <th :id="tags.title"
          class="infl-group"
          scope="col"
          :colspan="paradigms.length+1">
        {{tagToName(tags.title)}}
      </th>
    </template>
  </tr>
  </template>
  
<script>
import { inflectedForm, tagToName } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsAdj',
    props: ['paradigms','tags','locLang','lemma-id'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: !this.tags.title ?
                this.paradigms.map(
                    p => this.inflForm(p,
                                        this.tags.tags,
                                        this.tags.excl))
                .filter(r => r) :
                []
        }
    },
    methods: {
        inflForm: function (paradigm, tagList, exclTagList) {
            return inflectedForm(paradigm, tagList, exclTagList)
        },
        tagToName: function (tag) {
            return tagToName(tag, this.locLang) || tag
        }
    }
}
</script>
