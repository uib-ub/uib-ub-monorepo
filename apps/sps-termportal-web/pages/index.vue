<template>
  <main class="container">
    <Head>
      <Title>{{ $t("index.title") }}</Title>
    </Head>
    <div class="border-grey my-2 border-b-2 px-2">
      <SearchField />
      <HeaderSearchOptions class="pt-2" />
      <HeaderDomains />
    </div>
    <div class="flex flex-col gap-x-8 gap-y-6 pt-6 lg:flex-row">
      <WelcomeTP class="basis-GRb" />
      <DomainOverview class="basis-GRs" />
    </div>
  </main>
</template>
