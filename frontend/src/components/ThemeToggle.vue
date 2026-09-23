<template>
  <q-btn
    flat
    round
    :icon="isDark.isActive ? 'dark_mode' : 'light_mode'"
    :color="isDark.isActive ? 'amber' : 'white'"
    @click="toggleDarkMode"
  >
    <q-tooltip>
      {{ isDark.isActive ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { isDark, toggleDarkMode } = useTheme();
</script>