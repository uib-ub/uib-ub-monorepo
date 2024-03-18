<template>
  <div class="flex">
    <SideBar />
    <main class="">
      <header>
        <h1 class="pb-12">
          <LogoTermportalen img-style="width: 450px" />
          <div class="font-base ml-[133px] mt-[-25px] text-xl text-gray-500">
            admin
          </div>
        </h1>
      </header>
      <div class="space-y-12">
        <DashboardTermbaseStatus />
        <div class="flex space-x-12">
          <DashboardRecentActivities />
          <DashboardUpcomingActivities />
        </div>
      </div>
    </main>
  </div>
</template>
