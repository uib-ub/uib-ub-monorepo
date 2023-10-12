<template>
    <tr>
      <td v-for="([[rowspan,rowindex,forms],headers], index) in cells"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :index="rowindex"
          :headers="headers"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            @mouseover="$emit('hilite', rowindex, lemmaId)"
            @mouseleave="$emit('unhilite')">
        <span v-for="(form, i) in forms"
              :key="i"
              class='comma'
              >
        {{form}}</span>
      </td>
    </tr>
</template>
    
<script>
    
    
    
import { inflectedForm, tagToName
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm','language','lemma-id'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: [ this.inflForm(['Masc'],'Sing Masc'),
                        this.inflForm(['Fem'],'Sing Frem'),
                        this.inflForm(['Neuter'],'Sing Neuter'),
                        this.inflForm(['Def'],'Sing Def'),
                        this.inflForm([ 'Plur'],'Plur')
                    ].filter(r => r[0])
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }


    }
}
</script>