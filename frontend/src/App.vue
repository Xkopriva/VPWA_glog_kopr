<template>
  <router-view />
</template>

<script setup lang="ts">
import { restoreTheme } from '@/composables/useTheme';

// obnoví uloženú tému (dark / light) po refreshi stránky
restoreTheme();
</script>
