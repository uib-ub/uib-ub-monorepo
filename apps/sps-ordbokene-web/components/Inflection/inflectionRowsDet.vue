<template>
  <tr class="infl-row">
    <template v-if="tags.tags && cells.length">
      <th :id="tags.label"
          class="infl-label xs"
          scope="row">
        {{tagToName(tags.label)}}
      </th>
      <td v-for="([rowspan,rowindex,forms], index) in cells"
          :key="index"
          class="notranslate infl-cell xs"
          :colspan="rowspan"
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
        {{tags.title? $t('infl_table_tag' + tags.title, 1, {locale}) : ''}}
      </th>
    </template>
  </tr>
</template>
  
<script>



import { inflectedForm, tagToName
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsAdj',
    props: ['paradigms','tags','locale','lemmaId'],
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
        }
    }
}
</script>
  