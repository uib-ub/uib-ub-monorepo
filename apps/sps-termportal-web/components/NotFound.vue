<template>
  <div>
    <Head>
      <Title>{{ $t("notFound.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-3xl">
        <h1
          id="main"
          class="mt-3.5 mb-2 text-3xl"
        >
          {{ $t("notFound.title") }}
        </h1>
        <p>
          {{ message }}
        </p>
        <AppLink
          v-if="termbase && concept"
          :to="`/tb/${termbase}`"
          class="mt-4 mr-4 inline-block underline"
        >
          {{ $t("notFound.toTermbase") }}
        </AppLink>
        <AppLink
          to="/"
          class="mt-4 inline-block underline"
        >
          {{ $t("notFound.toFrontpage") }}
        </AppLink>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  termbase?: string | null;
  concept?: string | null;
}>();

const { t } = useI18n();
const message = computed(() => {
  if (props.termbase && props.concept) {
    return t("notFound.concept", {
      concept: props.concept,
      termbase: props.termbase,
    });
  }
  if (props.termbase) {
    return t("notFound.termbase", { id: props.termbase });
  }
  return t("notFound.page");
});

if (import.meta.server) {
  setResponseStatus(useRequestEvent()!, 404);
}
</script>
