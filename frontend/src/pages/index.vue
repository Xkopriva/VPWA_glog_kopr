<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent">
      <div class="q-pa-sm">
        <q-toolbar class="bg-secondary text-white top-bar">
          <q-btn flat dense round icon="menu" aria-label="Kanály" class="lt-md" @click="drawer = !drawer" />

          <q-toolbar-title class="row items-center">
            <span class="gt-sm row items-center">
              <img alt="Flack logo" src="~@/assets/OnlyLogo.png" style="height: 32px; width: auto" class="q-mr-sm" />
              <span class="text-bold">Flack</span>
            </span>
          </q-toolbar-title>

          <div class="gt-md q-mr-sm">Quasar v{{ $q.version }}</div>
          <theme-toggle />

          <template v-if="me">
            <q-btn flat round icon="settings" @click="ui.settingsDialog = true"><q-tooltip>Nastavenia</q-tooltip></q-btn>
            <q-btn flat round icon="logout" @click="onLogout"><q-tooltip>Odhlásiť</q-tooltip></q-btn>
          </template>
        </q-toolbar>
      </div>
    </q-header>

    <q-drawer v-if="me" v-model="drawer" show-if-above :width="320" :breakpoint="1024">
      <SideBar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="me" class="bg-transparent">
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

const { me, logout, init } = useChat();
const router = useRouter();
const drawer = ref(false);
onMounted(init);
function onLogout() { logout(); void router.push('/landing'); }
</script>


<style>
body { /* defaultny white style, ten nemame css, mame dark mode css */
  --bg: color-mix(in srgb, var(--q-primary) 6%, #f2f3f7);
  --panel: #ffffff;
  --panel-2: color-mix(in srgb, var(--q-primary) 7%, #f0f1f5);
  --hover: rgba(0, 0, 0, 0.045);
  --dim: rgba(0, 0, 0, 0.55);
  --radius: 22px;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 10px 28px rgba(16, 24, 40, 0.06);
  --mention: var(--q-secondary);
}
body.body--dark {
  --bg: #000000;
  --panel: #181818;
  --panel-2: #262626;
  --hover: rgba(255, 255, 255, 0.07);
  --dim: rgba(255, 255, 255, 0.6);
  --shadow: none;
}
body, body.body--dark { background: var(--bg); }
.q-drawer, body.body--dark .q-drawer { background: transparent; }

.top-bar { border-radius: 18px; min-height: 52px; box-shadow: var(--shadow); }
.panel { background: var(--panel); border-radius: var(--radius); box-shadow: var(--shadow); }
.soft { background: var(--panel-2); border-radius: 14px; }
.dim { color: var(--dim); }
.hero { background: linear-gradient(135deg, var(--q-primary), var(--q-secondary)); color: #fff; border-radius: 22px; }

/* zaoblene dialogy a menu */
.q-btn:not(.q-btn--round) { border-radius: 999px; }
.q-card { border-radius: 22px; }
.q-menu { border-radius: 16px; }
.q-notification { border-radius: 14px; }

/* prepinac (Public / Private) */
.seg { display: flex; background: var(--panel-2); border-radius: 999px; padding: 3px; gap: 2px; }
.seg button { flex: 1; border: 0; background: transparent; color: inherit; font: inherit; font-size: 13px; cursor: pointer;
  border-radius: 999px; padding: 7px 10px; opacity: 0.7; transition: background 0.15s, opacity 0.15s; }
.seg button.on { background: var(--q-primary); color: #fff; opacity: 1; font-weight: 600; }

/* channels */
.ch-row { border-radius: 14px; margin: 2px 0; min-height: 56px; }
.ch-row:hover { background: var(--hover); }
.ch-row.q-item--active, .ch-row.ch-active { background: color-mix(in srgb, var(--q-primary) 15%, transparent); color: inherit; }
</style>
