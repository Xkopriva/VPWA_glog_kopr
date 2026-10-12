<template>
  <div v-if="activeChannel" class="q-px-md q-pt-xs text-caption text-grey" style="min-height: 22px">
    <template v-if="typingUsers.length">
      <template v-for="(t, i) in typingUsers" :key="t.user.id">
        <a class="text-primary text-weight-bold cursor-pointer" @click="ui.liveUserId = t.user.id">{{ t.user.nickName }}</a><span v-if="i < typingUsers.length - 1">, </span>
      </template>
      {{ typingUsers.length > 1 ? 'are' : 'is' }} typing…
      <q-icon name="visibility" size="xs"><q-tooltip>Kliknite na meno pre živý náhľad</q-tooltip></q-icon>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useChat, ui } from '@/stores/chat';
const { activeChannel, typingUsers } = useChat();
</script>
