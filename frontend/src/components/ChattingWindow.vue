<template>
  <div v-if="activeChannel" :key="activeChannel.id" class="absolute-full">
    <q-scroll-area ref="area" class="fit q-pa-md">
      <!-- infinite scroll smerom hore (história), renderuje sa iba okno správ -->
      <q-infinite-scroll reverse :offset="150" :scroll-target="target" @load="onLoad">
        <template #loading>
          <div class="row justify-center q-my-md"><q-spinner color="primary" size="32px" /></div>
        </template>
        <div v-if="!hasMore" class="text-center text-caption text-grey q-my-md">
          Start of #{{ activeChannel.name }} history
        </div>

        <q-chat-message
          v-for="m in visible"
          :key="m.id"
          :name="userById(m.authorId)?.nickName"
          :avatar="avatar(m.authorId)"
          :stamp="date.formatDate(m.createdAt, 'D.M. HH:mm')"
          :sent="m.authorId === me?.id"
          :text-color="m.authorId === me?.id ? undefined : 'white'"
          :bg-color="bubble(m)"
        >
          <q-icon v-if="isForMe(m)" name="alternate_email" size="xs" class="q-mr-xs"><q-tooltip>Addressed to you</q-tooltip></q-icon>
          <template v-for="(p, i) in parts(m.text)" :key="i"><b v-if="p.mention">{{ p.t }}</b><span v-else>{{ p.t }}</span></template>
        </q-chat-message>
      </q-infinite-scroll>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { date, type QScrollArea } from 'quasar';
import { useChat, type Message } from '@/stores/chat';

const PAGE = 25;
const { me, activeChannel, channelMessages, userById } = useChat();
const area = ref<QScrollArea | null>(null);
const target = ref<Element | undefined>(undefined);
const shown = ref(PAGE);

const all = computed(() => (activeChannel.value ? channelMessages(activeChannel.value.id) : []));
const visible = computed(() => all.value.slice(-shown.value));
const hasMore = computed(() => shown.value < all.value.length);

const avatar = (id: number) => `https://cdn.quasar.dev/img/avatar${(id % 6) + 1}.jpg`;
const isForMe = (m: Message) => m.mentions.includes(me.value?.id ?? -1) && m.authorId !== me.value?.id;
// vaše farby: moje = amber-7, ostatné = primary; adresované mne = zvýraznené červenou
const bubble = (m: Message) => (isForMe(m) ? 'red-5' : m.authorId === me.value?.id ? 'amber-7' : 'primary');
const parts = (t: string) => t.split(/(@\w+)/g).filter(Boolean).map((s) => ({ t: s, mention: /^@\w+$/.test(s) }));

function onLoad(_: number, done: (stop?: boolean) => void) {
  setTimeout(() => { if (hasMore.value) shown.value += PAGE; done(!hasMore.value); }, 400); // simulovaná latencia servera
}
function toBottom() {
  void nextTick(() => { const el = area.value?.getScrollTarget(); if (el) el.scrollTop = el.scrollHeight; });
}

watch(() => activeChannel.value?.id, async () => {
  shown.value = PAGE;
  await nextTick();
  target.value = area.value?.getScrollTarget();
  toBottom();
}, { immediate: true, flush: 'post' });

watch(() => all.value.length, () => {   // nová správa -> posun dole, ak je používateľ pri konci alebo píše sám
  const el = area.value?.getScrollTarget(); const last = all.value[all.value.length - 1];
  if (el && (el.scrollHeight - el.scrollTop - el.clientHeight < 200 || last?.authorId === me.value?.id)) toBottom();
});
</script>
