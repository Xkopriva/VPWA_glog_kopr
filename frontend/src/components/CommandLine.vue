<template>
  <div class="q-pa-sm">
    <!-- našepkávanie príkazov -->
    <q-list v-if="hints.length" dense bordered class="rounded-borders q-mb-sm">
      <q-item v-for="h in hints" :key="h.cmd" clickable @click="text = h.cmd + ' '; input?.focus()">
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ h.usage }}</q-item-label>
          <q-item-label caption>{{ h.desc }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-input ref="input" v-model="text" outlined :disable="!me" :label="label"
      @update:model-value="(v) => setTyping(String(v ?? ''))" @keyup.enter="submit">
      <template #after>
        <q-btn round flat color="primary" icon="send" :disable="!me" @click="submit" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify, type QInput } from 'quasar';
import { useChat, COMMANDS } from '@/stores/chat';

const { me, activeChannel, execute, setTyping } = useChat();
const router = useRouter();
const text = ref('');
const input = ref<QInput | null>(null);

const label = computed(() => !me.value ? 'Log in to send messages and commands'
  : activeChannel.value ? `Message to #${activeChannel.value.name} – @nick to address, /command` : 'Command line, e.g. /join general');
const hints = computed(() => (text.value.startsWith('/') && !text.value.includes(' ')
  ? COMMANDS.filter((c) => c.cmd.startsWith(text.value.toLowerCase())) : []));

function submit() {
  if (!text.value.trim()) return;
  const r = execute(text.value);
  if (r.message) Notify.create({ type: r.ok ? 'positive' : 'negative', message: r.message, position: 'top' });
  if (r.ok) {
    text.value = '';
    setTyping('');
    if (r.goTo) void router.push({ path: '/chatting', query: { c: r.goTo } });
  }
  input.value?.focus();
}
</script>
