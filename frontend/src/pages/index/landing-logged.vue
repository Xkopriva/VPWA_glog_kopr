<template>
  <q-page class="column items-center justify-center q-pa-md q-gutter-md">
    <div class="text-h5">Vitaj, {{ me?.firstName }}!</div>
    <div class="text-grey">Vyberte kanál v zozname alebo použite príkazový riadok dole.</div>
    <q-card flat bordered style="max-width: 560px; width: 100%">
      <q-card-section class="text-subtitle1 text-weight-bold">Dostupné príkazy</q-card-section>
      <q-list separator dense>
        <q-item v-for="c in COMMANDS" :key="c.cmd">
          <q-item-section><q-item-label class="text-weight-medium">{{ c.usage }}</q-item-label><q-item-label caption>{{ c.desc }}</q-item-label></q-item-section>
        </q-item>
        <q-item><q-item-section><q-item-label class="text-weight-medium">@nickName text</q-item-label><q-item-label caption>Adresuje správu používateľovi (zvýraznená mu)</q-item-label></q-item-section></q-item>
      </q-list>
    </q-card>
    <q-btn label="LOG OUT" color="negative" no-caps @click="out" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useChat, COMMANDS } from '@/stores/chat';
const { me, logout } = useChat(); const router = useRouter();
function out() { logout(); void router.push('/landing'); }
</script>
