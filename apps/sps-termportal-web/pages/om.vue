<template>
  <div>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-3xl">
        <ContentDoc
          :key="`about${locale}`"
          :head="false"
          :path="`/${locale}/om/about`"
          class="content-wrapper"
        />
        <Accordion multiple class="mt-6">
          <!-- About us-->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.aboutUs") }}</h2>
            </template>
            <ContentDoc
              :key="`aboutus${locale}`"
              :head="false"
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
              :key="`fagrad${locale}`"
              :head="false"
              :path="`/${locale}/om/fagrad`"
              class="content-wrapper"
            />
            <ContentDoc
              :key="`mandat${locale}`"
              :head="false"
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
              :head="false"
              :path="`/${locale}/om/history`"
              class="content-wrapper"
            />
            <ContentDoc
              :key="`publications${locale}`"
              :path="`/${locale}/om/publications`"
              :head="false"
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
              :key="`get-started${locale}`"
              :head="false"
              :path="`/${locale}/om/get-started`"
              class="content-wrapper plain-list-indent"
            />
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">{{ $t("om.links") }}</h2>
            </template>
            <ContentDoc
              :key="`links${locale}`"
              :head="false"
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
