<template>
  <!-- /list: členovia kanála -->
  <q-dialog v-model="ui.membersDialog">
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">Členovia #{{ activeChannel?.name }}</q-card-section>
      <q-list v-if="activeChannel">
        <q-item v-for="id in activeChannel.members" :key="id">
          <q-item-section avatar><q-icon name="circle" :color="color[userById(id)!.status]" size="xs" /></q-item-section>
          <q-item-section>{{ userById(id)!.firstName }} {{ userById(id)!.lastName }}<q-item-label caption>@{{ userById(id)!.nickName }} · {{ userById(id)!.status }}</q-item-label></q-item-section>
          <q-item-section v-if="id === activeChannel.adminId" side><q-badge color="amber" text-color="dark" label="správca" /></q-item-section>
        </q-item>
      </q-list>
      <q-card-actions align="right"><q-btn flat label="Zavrieť" v-close-popup /></q-card-actions>
    </q-card>
  </q-dialog>

  <!-- nastavenia -->
  <q-dialog v-model="ui.settingsDialog">
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">Nastavenia</q-card-section>
      <q-card-section>
        <q-toggle v-model="state.mentionsOnly" label="Notifikácie iba pre správy adresované mne (@nick)" />
        <div class="text-caption text-grey q-mt-sm">V stave DND ani offline notifikácie neprichádzajú.</div>
        <q-btn class="q-mt-md" outline no-caps color="primary" icon="notifications" label="Povoliť systémové notifikácie" @click="requestNotifyPermission" />
      </q-card-section>
      <q-card-actions align="right"><q-btn flat label="Zavrieť" v-close-popup /></q-card-actions>
    </q-card>
  </q-dialog>

  <!-- živý náhľad rozpísanej správy -->
  <q-dialog :model-value="ui.liveUserId !== null" @update:model-value="ui.liveUserId = null">
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">{{ ui.liveUserId ? userById(ui.liveUserId)?.nickName : '' }} práve píše…</q-card-section>
      <q-card-section class="bg-grey-3 text-dark q-ma-md rounded-borders" style="min-height: 60px">{{ liveDraft || '(momentálne nepíše)' }}</q-card-section>
      <q-card-actions align="right"><q-btn flat label="Zavrieť" v-close-popup /></q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useChat, ui } from '@/stores/chat';
const { state, activeChannel, userById, requestNotifyPermission } = useChat();
const color = { online: 'positive', dnd: 'negative', offline: 'grey' } as const;
const liveDraft = computed(() => (activeChannel.value && ui.liveUserId ? state.typing[activeChannel.value.id]?.[ui.liveUserId] : ''));
</script>
