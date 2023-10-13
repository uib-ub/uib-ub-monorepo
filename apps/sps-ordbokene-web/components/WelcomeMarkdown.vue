<script setup>

const props = defineProps({
    path: String
})


const { data, error} = await useAsyncData(props.path, () => queryContent(props.path).find())

</script>
<template>
<ContentRenderer :value="data[0]">
      <template #empty>
        <slot/>
      </template>
    </ContentRenderer>

</template>