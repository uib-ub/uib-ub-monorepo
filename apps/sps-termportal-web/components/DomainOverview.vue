<template>
  <section>
    <h2 id="domener" class="pb-1 text-2xl">
      <AppLink to="#domener">{{
        $t("domainOverview.domainsAndBases")
      }}</AppLink>
    </h2>
    <ul class="pl-1">
      <DomainOverviewEntry
        v-for="domain in Object.keys(domainNesting)"
        :key="domain"
        :domain="domain"
      />
    </ul>
  </section>
</template>
