<template>
  <main class="flex space-x-[7rem]">
    <section class="ml-6">
      <h2 class="text-lg font-semibold pb-2 text-gray-800">Navigation</h2>
      <ul class="font-base space-y-[-6px] text-xl text-gray-500">
        <NavBarLink to="overview">Termbase Overview</NavBarLink>
        <NavBarLink to="/insights">Insights</NavBarLink>
        <NavBarLink to="/quality/termbase">Quality</NavBarLink>
        <NavBarLink
          >Explore
          <ul class="ml-4 space-y-[-6px]">
            <NavBarLink to="/explore/termbase">Termbase</NavBarLink>
          </ul>
        </NavBarLink>
        <NavBarLink to="/activities">Activities</NavBarLink>
        <NavBarLink to="/docs">Documentation</NavBarLink>
        <NavBarLink to="/studio">Studio</NavBarLink>
      </ul>
    </section>
    <RecentActivities />
  </main>
</template>
