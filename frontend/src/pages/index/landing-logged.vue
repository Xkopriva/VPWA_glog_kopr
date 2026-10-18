<template>
  <q-page class="q-pa-md" style="max-width: 980px; margin: 0 auto">
    <!-- uvítací banner -->
    <div class="hero q-pa-xl q-mb-lg">
      <div class="text-h4 text-weight-bold">{{ greeting }}, {{ me?.firstName }}!</div>
      <div class="q-mt-sm" style="opacity: 0.9">Vyberte kanál v zozname vľavo alebo použite príkazový riadok dole.</div>
    </div>

    <div class="text-h6 text-weight-bold q-mb-md">Dostupné príkazy</div>
    <div class="row q-col-gutter-md">
      <div v-for="c in COMMANDS" :key="c.cmd" class="col-12 col-sm-6 col-md-4">
        <div class="panel q-pa-md fit">
          <code class="cmd">{{ c.usage }}</code>
          <div class="q-mt-sm dim">{{ c.desc }}</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <div class="panel q-pa-md fit">
          <code class="cmd">@nickName text</code>
          <div class="q-mt-sm dim">Adresuje správu používateľovi (zvýraznená mu)</div>
        </div>
      </div>
    </div>

    <div class="row justify-center q-mt-xl">
      <q-btn outline color="negative" no-caps icon="logout" label="LOG OUT" class="q-px-lg" @click="out" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChat, COMMANDS } from '@/stores/chat';
const { me, logout } = useChat(); const router = useRouter();
const greeting = computed(() => { const h = new Date().getHours(); return h < 10 ? 'Dobré ráno' : h < 18 ? 'Dobrý deň' : 'Dobrý večer'; });
function out() { logout(); void router.push('/landing'); }
</script>

<style scoped>
.cmd { background: var(--panel-2); border-radius: 999px; padding: 4px 12px; font-size: 13px; font-weight: 600; display: inline-block; }
</style>
