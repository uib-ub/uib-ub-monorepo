<template>
    <tr>
      <td v-for="([rowspan,rowindex,forms], index) in cells"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span v-for="(form, i) in forms"
              :key="i"
              class='comma'>
        {{form}}</span>
      </td>
    </tr>
</template>
    
<script>



import { inflectedForm
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm', 'lemmaId'],
    emits: ['hilite', 'unhilite'],
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
        }
    }
}
</script>
    