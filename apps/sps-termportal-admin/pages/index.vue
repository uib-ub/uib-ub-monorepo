<template>
  <main>
    <ul class="font-base ml-6 space-y-[-6px] text-xl text-gray-500">
      <NavBarLink to="overview">Termbase Overview</NavBarLink>
      <NavBarLink to="/insights">Insights</NavBarLink>
      <NavBarLink
        >Explore
        <ul class="ml-4 space-y-[-6px]">
          <NavBarLink to="/explore/termbase">Termbase</NavBarLink>
        </ul>
      </NavBarLink>
      <NavBarLink to="/docs">Documentation</NavBarLink>
      <NavBarLink to="/studio">Studio</NavBarLink>
    </ul>
  </main>
</template>
