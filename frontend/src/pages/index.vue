<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Kanály" class="lt-md" @click="drawer = !drawer" />


        <q-toolbar-title class="row items-center">
          <!-- logo and Flack text will disappear with the drawer (same breakpoint) -->
          <span class="gt-sm row items-center">
            <img
              alt="Flack logo"
              src="~@/assets/OnlyLogo.png"
              style="height: 32px; width: auto;"
              class="q-mr-sm"
            />
            <span class="text-bold">Flack</span>
          </span>
          
          <span v-if="activeChannel" class="q-ml-md text-weight-light"># {{ activeChannel.name }}</span>
        </q-toolbar-title>
        
        <div class="gt-md">Quasar v{{ $q.version }}</div>
        <theme-toggle />

        <template v-if="me">
          <q-btn v-if="activeChannel" flat round icon="group" @click="ui.membersDialog = true"><q-tooltip>Členovia (/list)</q-tooltip></q-btn>
          <q-btn flat round icon="settings" @click="ui.settingsDialog = true"><q-tooltip>Nastavenia</q-tooltip></q-btn>
          <q-btn flat round icon="logout" @click="onLogout"><q-tooltip>Odhlásiť</q-tooltip></q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered :width="300" :breakpoint="1024">
      <SideBar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- stavová lišta + príkazový riadok = "fixný" prvok aplikácie -->
    <q-footer bordered :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
      <TypingBar />
      <CommandLine />
    </q-footer>

    <AppDialogs />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ThemeToggle from '@/components/ThemeToggle.vue';
import SideBar from '@/components/SideBar.vue';
import CommandLine from '@/components/CommandLine.vue';
import TypingBar from '@/components/TypingBar.vue';
import AppDialogs from '@/components/AppDialogs.vue';
import { useChat, ui } from '@/stores/chat';

const { me, activeChannel, logout, init } = useChat();
const router = useRouter();
const drawer = ref(false);
onMounted(init);
function onLogout() { logout(); void router.push('/landing'); }
</script>
