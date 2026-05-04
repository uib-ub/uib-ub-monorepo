<template>
  <div>
    <h2
      id="news"
      class="pb-3 text-2xl"
    >
      <AppLink to="#news">
        {{ $t("news.heading") }}
      </AppLink>
    </h2>
    <UtilsTransitionOpacitySection>
      <dl
        v-if="data"
        class="news-wrapper space-y-4"
      >
        <template
          v-for="entry in data"
          :key="entry.date + entry.title"
        >
          <NewsEntry
            :title="entry.title"
            :title-lang="entry.titleLang"
            :content-lang="entry.contentLang"
            :date="entry.date"
          >
            <SanityContentWrapper :blocks="entry.content" />
          </NewsEntry>
        </template>
      </dl>
    </UtilsTransitionOpacitySection>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();

const { data } = useLazyFetch(`/api/news/${locale.value}`);
</script>

<style>
@reference "tailwindcss";

.news-wrapper a {
  @apply underline underline-offset-2 hover:decoration-2;
}

.news-wrapper div + div {
  @apply border-t-2 pt-2;
}
</style>
