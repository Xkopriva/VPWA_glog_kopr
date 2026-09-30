<template>
  <div class="col-9">
    <q-input class="q-mb-md" v-model="text" label="Chat window / Command line" outlined/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');
</script>