<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Kanály" class="lt-md" @click="drawer = !drawer" />

        <q-toolbar-title>
          IMAGE Flack
          <span v-if="activeChannel" class="q-ml-md text-weight-light"># {{ activeChannel.name }}</span>
        </q-toolbar-title>

        <!-- Dark Mode Toggle Button -->
        <q-btn
          class="q-mx-md"
          :color="$q.dark.isActive ? 'amber' : 'dark'"
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :label="$q.screen.gt.sm ? ($q.dark.isActive ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined"
          no-caps
          @click="$q.dark.toggle()"
        />
        <div class="gt-md">Quasar v{{ $q.version }}</div>
        <!-- TODO: theme toggle was already impelemented,
        decide if you want the button up or this component, i think the component is better -->
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
