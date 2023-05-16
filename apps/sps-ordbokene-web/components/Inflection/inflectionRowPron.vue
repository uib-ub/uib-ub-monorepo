<template>
<tr>
  <td class="notranslate infl-cell"
      v-for="([rowspan,rowindex,forms], index) in cells"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
        v-on:mouseover="$emit('hilite', rowindex, lemmaId)"
        v-on:mouseleave="$emit('unhilite')">
    <span class='comma'
          v-for="(form, i) in forms"
          :key="i">
    {{form}}</span>
  </td>
</tr>
</template>

<script>



import { inflectedForm, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm','language','lemmaId'],
    data: function () {
        return {
            cells: [
                this.inflForm(['Nom']),
                this.inflForm(['Acc']),
                this.inflForm(['Neuter'])
            ].filter(r => r)
        }
    },
    methods: {
        inflForm: function (tagList) {
            return inflectedForm(this.paradigm, tagList)
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }    }
}
</script>
