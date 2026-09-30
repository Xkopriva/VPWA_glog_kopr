<template>
  <div>
    <q-input v-model="text" label="Chat window / Command line" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');
</script>