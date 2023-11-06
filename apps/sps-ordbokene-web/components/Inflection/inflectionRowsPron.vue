<template>
    <tr class="infl-row">
      <template v-if="tags.tags">
        <th v-if="tags.label"
            :id="tags.label"
            class="infl-label xs"
            scope="row">
          {{tags.label? $t('infl_table_tags.' + label, 1, {locale}) : '' }}
        </th>
        <td class="notranslate infl-cell"
            v-for="([rowspan,rowindex,forms], index) in cells"
            :key="index"
            :colspan="rowspan"
            :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            @mouseover="$emit('hilite', rowindex, lemmaId)"
            @mouseleave="$emit('unhilite')">
          <span v-for="(form, index2) in forms"
                :key="index2"
                class='comma'>
            {{form}}</span>
        </td>
      </template>
    </tr>
</template>
    
<script>



import { inflectedForm, tagToName
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsPron',
    props: ['paradigms','lemma','tags','language','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: this.paradigms.map(p => this.inflForm(p, this.tags.tags))
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (paradigm, tagList) {
            const forms = inflectedForm(paradigm, tagList, [])
            return forms || [1,0,[this.lemma]] // workaround for missing inflection
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }
    }
}
</script>