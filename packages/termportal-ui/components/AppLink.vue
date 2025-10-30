<template>
  <NuxtLink v-if="linkType === LinkType.Internal" :to="to" :target="target"
    ><slot
  /></NuxtLink>
  <a v-else-if="linkType === LinkType.Anchor" :href="to" :target="target"
    ><slot
  /></a>
  <NuxtLink
    v-else-if="linkType === LinkType.External"
    class="inline-flex"
    :to="to"
    :target="target || '_blank'"
  >
    <span>
      <slot />
    </span>
    <IconExternalLink v-if="!hideIcon" class="ml-0.5 translate-y-1"/>
  </NuxtLink>
  <NuxtLink v-else :to="to" :target="target"><slot /></NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  to: string,
  target?: '_blank' | '_self' | '_parent' | '_top',
  hideIcon?: boolean

}>(), {
    hideIcon: false
  })

enum LinkType {
  Internal = 'internal',
  Anchor = 'anchor',
  External = 'external',
  Unknown = 'unknown'
}

const linkType = computed<LinkType>(() => {
   const url = props.to.trim()
   
  if (!url) return LinkType.Unknown
  if (url.startsWith('/')) return LinkType.Internal
  if (url.startsWith('#')) return LinkType.Anchor
  if (/^https?:\/\//i.test(url)) return LinkType.External
  // if (/^mailto:|tel:/i.test(url)) return LinkType.External
  return LinkType.Unknown
})

</script>
