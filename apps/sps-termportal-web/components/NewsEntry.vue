<template>
  <div class="news-item max-w-md">
    <dt
      class="font-semibold"
      :lang="locale !== titleLang ? titleLang : undefined"
    >
      {{ title }}
    </dt>
    <dd class="text-sm text-gray-600">{{ prettyDate }}</dd>
    <dd
      class="space-y-1 pt-1"
      :lang="locale !== contentLang ? contentLang : undefined"
    >
      <slot />
    </dd>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();

const props = defineProps({
  title: { type: String, required: true },
  titleLang: { type: String, required: true },
  contentLang: { type: String, required: true },
  date: { type: String, required: true },
});

const prettyDate = computed(() => {
  return new Date(props.date).toLocaleString(locale.value, {
    dateStyle: "medium",
    timeStyle: undefined,
  });
});

// Fix for missing serialization with current nuxt/sanity setup
onMounted(() => {
  document.querySelectorAll(".news-item a").forEach(function (el) {
    el.setAttribute("target", "_blank");
  });
});
</script>
