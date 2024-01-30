<template>
  <div>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-3xl">
        <ContentDoc :path="`/${locale}/om/about`" class="content-wrapper" />
        <Accordion multiple class="mt-6">
          <!-- About us-->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.aboutUs") }}</h2>
            </template>
            <ContentDoc
              :path="`/${locale}/om/about-us`"
              class="content-wrapper"
            />
          </AccordionTab>
          <!-- Fagrådet -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.fagrad") }}</h2>
            </template>
            <ContentDoc
              :path="`/${locale}/om/fagrad`"
              class="content-wrapper"
            />
            <ContentDoc
              :key="`mandat${locale}`"
              :path="`/${locale}/om/fagrad-mandat`"
              class="content-wrapper"
            />
          </AccordionTab>
          <!-- History -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.history") }}</h2>
            </template>
            <ContentDoc
              :key="`history${locale}`"
              :path="`/${locale}/om/history`"
              class="content-wrapper"
            />
            <ContentDoc
              :path="`/${locale}/om/publications`"
              class="content-wrapper"
            />
          </AccordionTab>
          <!-- Get started -->
          <AccordionTab>
            <template #header>
              <h2 id="kommeiGang" class="font-semibold">
                {{ $t("om.kommeiGang") }}
              </h2>
            </template>
            <ContentDoc
              :path="`/${locale}/om/get-started`"
              class="content-wrapper plain-list-indent"
            />
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.links") }}</h2>
            </template>
            <ContentDoc
              :path="`/${locale}/om/links`"
              class="content-wrapper plain-list-indent"
            />
          </AccordionTab>
        </Accordion>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>
