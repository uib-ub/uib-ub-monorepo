<script setup>

const props = defineProps({
    path: String
})

const { data, error } = await useAsyncData('page-data' + props.path, () => queryContent(props.path).findOne())
</script>
<template>
    <ContentRenderer :value="data">
      <template #empty>
        <slot/>
      </template>
    </ContentRenderer>
</template>