<template>
  <div v-if="activeChannel" class="q-px-md q-pb-xs" style="min-height: 26px">
    <span v-if="typingUsers.length" class="pill text-caption">
      <span class="dots"><i /><i /><i /></span>
      <template v-for="(t, i) in typingUsers" :key="t.user.id">
        <a class="text-primary text-weight-bold cursor-pointer" @click="ui.liveUserId = t.user.id">{{ t.user.nickName }}</a><span v-if="i < typingUsers.length - 1">, </span>
      </template>
      {{ typingUsers.length > 1 ? 'are' : 'is' }} typing…
      <q-tooltip>Kliknite na meno pre živý náhľad</q-tooltip>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useChat, ui } from '@/stores/chat';
const { activeChannel, typingUsers } = useChat();
</script>

<style scoped>
.pill { display: inline-flex; align-items: center; gap: 6px; background: var(--panel); box-shadow: var(--shadow); border-radius: 999px; padding: 3px 12px; }
.dots { display: inline-flex; gap: 3px; }
.dots i { width: 5px; height: 5px; border-radius: 50%; background: var(--q-primary); animation: bounce 1.2s infinite ease-in-out; }
.dots i:nth-child(2) { animation-delay: 0.15s; }
.dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }
</style>
