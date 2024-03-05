<template>
  <div>
    <h2 id="news" class="pb-3 text-2xl">
      <AppLink to="#news">{{ $t("news.heading") }}</AppLink>
    </h2>
    <dl class="news-wrapper space-y-4">
      <template v-for="entry in data" :key="entry.date + entry.title">
        <NewsEntry :title="entry.title" :date="entry.date">
          <SanityContentWrapper :blocks="entry.content" />
        </NewsEntry>
      </template>
    </dl>
  </div>
</template>
<script setup lang="ts">
// behaviour needs to be documented:
// https://git.app.uib.no/spraksamlingane/terminologi/terminologi-content/-/blob/main/admin/system-behaviour.md
const langOrder = useLocaleLangOrder();

const query = `
*[_type == "news"
  && !(_id in path("drafts.**"))
  && defined(date)
  && dateTime(date) < dateTime(now())
]{
  date,
  "title": coalesce(title${langOrder.value[0]}, title${langOrder.value[1]}, title${langOrder.value[2]}),
  "content": coalesce(content${langOrder.value[0]}, content${langOrder.value[1]}, content${langOrder.value[2]})
} | order(end desc)[0...3]
`;

const { data } = useLazySanityQuery(query);

// Fix for missing serialization with current nuxt/sanity setup
onMounted(() => {
  document.querySelectorAll(".news-wrapper a").forEach(function (el) {
    el.setAttribute("target", "_blank");
  });
});
</script>

<style>
.news-wrapper a {
  @apply underline underline-offset-2 hover:decoration-2;
}

.news-wrapper div + div {
  @apply border-t-2 pt-2;
}
</style>
