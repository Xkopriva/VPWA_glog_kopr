<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <img
        alt="Flack logo"
        src="~@/assets/FlackLogo.png"
        style="width: 200px; height: 200px"
      />
      
      <!-- Dark Mode Toggle Button -->
      <q-btn
        class="q-mt-md"
        :color="$q.dark.isActive ? 'amber' : 'dark'"
        :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
        :label="$q.dark.isActive ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        no-caps
        @click="$q.dark.toggle()"
      />

      <q-btn class="q-mt-md" color="primary" to="/landing" label="Go to landing page" no-caps />
    </div>
  </q-page>
</template>

<script setup lang="ts">
//
</script>
