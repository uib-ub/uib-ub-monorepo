<template>
    <tr>
      <td v-for="([prefix, [rowspan,rowindex,forms], suffix], index) in rows"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span v-for="(form, index2) in forms"
              :key="index2"
              class='comma nobr'>
          <em v-if="prefix" class="context">{{prefix}}</em>&nbsp;{{form}}<em v-if="suffix" class="context">{{suffix}}</em>
        </span>
      </td>
    </tr>
</template>

<script>



import { inflectedForm, hasInflForm
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowVerb',
    props: ['paradigm','part','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            rows: [ !this.part || this.part === 1 ? this.inflForm(['Inf'],['Pass'],'å') : null,
                    !this.part || this.part === 1 ? this.inflForm(['Pres'],['Pass']) : null,
                    !this.part || this.part === 1 ? this.inflForm(['Past']) : null,
                    !this.part || this.part === 2 ? this.inflForm(['<PerfPart>'],['Adj'],'har') : null,
                    (!this.part || this.part === 2) && hasInflForm(this.paradigm,['Imp']) ?
                    this.inflForm(['Imp'],null,null,'!') : null
                    ].filter(r => r)
        }
    },
    methods: {
        inflForm: function (tagList,exclTagList,prefix,suffix) {
            const forms = inflectedForm(this.paradigm, tagList, exclTagList)
            if (forms) {
                return [prefix, forms, suffix]
            } else {
                return null
            }
        }    }
}
</script>