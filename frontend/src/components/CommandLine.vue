<template>
  <div class="q-px-sm q-pb-sm">
    <!-- našepkávanie príkazov -->
    <div v-if="hints.length" class="panel q-pa-xs q-mb-sm">
      <q-list dense>
        <q-item v-for="h in hints" :key="h.cmd" clickable class="ch-row" style="min-height: 44px" @click="text = h.cmd + ' '; input?.focus()">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ h.usage }}</q-item-label>
            <q-item-label caption>{{ h.desc }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="panel row items-center no-wrap q-pl-md q-pr-sm q-py-xs">
      <q-icon name="terminal" class="dim q-mr-sm" />
      <q-input ref="input" v-model="text" class="col" borderless dense :disable="!me" :placeholder="label"
        @update:model-value="(v) => setTyping(String(v ?? ''))" @keyup.enter="submit" />
      <q-btn round unelevated color="primary" icon="send" :disable="!me || !text.trim()" @click="submit" />
    </div>
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
  : activeChannel.value ? `Message #${activeChannel.value.name} – @nick to address, /command` : 'Command line, e.g. /join general');
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
