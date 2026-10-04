<template>
  <!-- TODO: replace style="height: 93vh;" with custom class that sets that div to 93vh - it does 93% of viewport height -->
  <div class="column q-pa-sm" style="height: 93vh; border-style: none solid none none; border-color: DodgerBlue;">

    <q-btn
      class="text-subtitle1 text-center q-pa-sm q-mx-sm q-my-lg full-width"
      :color="isPrivate ? 'primary' : 'secondary'"
      :label="isPrivate ? 'Private Server List' : 'Public Server List'"
      no-caps
      @click="isPrivate = !isPrivate"
    />

    <!-- scrollable area with server names -->
    <q-scroll-area class="col" style="height: 100%;">
      <div class="column q-gutter-y-sm">
        <q-btn
          v-for="n in 7"
          :key="n"
          :label="`Server name ${n}`"
          :to="`/server${n}`"
          outline
          class="full-width dark"
        />
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// isPrivate values: true = private, false = public
const isPrivate = ref(true);
</script>