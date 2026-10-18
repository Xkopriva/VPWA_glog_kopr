<template>
  <div v-if="activeChannel" :key="activeChannel.id" class="column no-wrap absolute-full">
    <div class="head row items-center no-wrap q-px-md q-py-sm">
      <ChannelTile :name="activeChannel.name" :type="activeChannel.type" :size="42" />
      <div class="q-ml-md col ellipsis">
        <div class="text-subtitle1 text-weight-bold ellipsis">{{ activeChannel.name }}</div>
        <div class="text-caption dim">{{ activeChannel.type === 'private' ? 'Private' : 'Public' }} channel · {{ activeChannel.members.length }} members</div>
      </div>
      <q-btn flat round icon="group" @click="ui.membersDialog = true"><q-tooltip>Members (/list)</q-tooltip></q-btn>
    </div>

    <q-scroll-area ref="area" class="col">
      <div class="q-px-md q-pb-md">
        <!-- infinite scroll smerom hore (história), renderuje sa iba okno správ -->
        <q-infinite-scroll v-if="target" reverse :offset="150" :scroll-target="target" @load="onLoad">
          <template #loading>
            <div class="row justify-center q-my-md"><q-spinner color="primary" size="32px" /></div>
          </template>
          <div v-if="!hasMore" class="text-center text-caption dim q-my-md">Start of #{{ activeChannel.name }}</div>

          <template v-for="r in rows" :key="r.m.id">
            <div v-if="r.sep" class="day-sep"><span>{{ r.sep }}</span></div>
            <div class="msg" :class="{ own: r.own, grouped: !r.head }">
              <div class="msg-av">
                <q-avatar v-if="r.head" size="36px"><img :src="avatar(r.m.authorId)" /></q-avatar>
              </div>
              <div class="msg-body">
                <div v-if="r.head" class="meta">
                  <b>{{ userById(r.m.authorId)?.nickName }}</b>
                  <span class="dim">{{ date.formatDate(r.m.createdAt, 'HH:mm') }}</span>
                </div>
                <div class="bubble" :class="{ own: r.own, mention: r.forMe }" :title="date.formatDate(r.m.createdAt, 'D.M.YYYY HH:mm')">
                  <template v-for="(p, i) in parts(r.m.text)" :key="i">
                    <b v-if="p.mention" class="mention-tag">{{ p.t }}</b><template v-else>{{ p.t }}</template>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </q-infinite-scroll>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { date, type QScrollArea } from 'quasar';
import ChannelTile from '@/components/ChannelTile.vue';
import { useChat, ui, type Message } from '@/stores/chat';

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
const day = (ts: number) => date.formatDate(ts, 'D.M.YYYY');

// zoskupovanie po sebe iducich sprav
const rows = computed(() => visible.value.map((m, i, arr) => {
  const prev = arr[i - 1];
  const newDay = !prev || day(prev.createdAt) !== day(m.createdAt);
  const head = !prev || newDay || prev.authorId !== m.authorId || m.createdAt - prev.createdAt > 5 * 60_000;
  return { m, head, sep: newDay ? day(m.createdAt) : '', own: m.authorId === me.value?.id, forMe: isForMe(m) };
}));

// safe zvyraznenie @mentionov
const parts = (t: string) => t.split(/(@\w+)/g).filter(Boolean).map((s) => ({ t: s, mention: /^@\w+$/.test(s) }));

function onLoad(_: number, done: (stop?: boolean) => void) {
  setTimeout(() => { if (hasMore.value) shown.value += PAGE; done(!hasMore.value); }, 400); // simulovana latencia servera
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

watch(() => all.value.length, () => {   // nova sprava -> posun dole
  const el = area.value?.getScrollTarget(); const last = all.value[all.value.length - 1];
  if (el && (el.scrollHeight - el.scrollTop - el.clientHeight < 200 || last?.authorId === me.value?.id)) toBottom();
});
</script>

<style scoped>
.head { border-bottom: 1px solid var(--hover); }
.day-sep { text-align: center; margin: 16px 0 8px; }
.day-sep span { font-size: 12px; background: var(--panel-2); color: var(--dim); border-radius: 999px; padding: 3px 12px; }

.msg { display: flex; gap: 10px; margin-top: 12px; }
.msg.grouped { margin-top: 3px; }
.msg.own { flex-direction: row-reverse; }
.msg-av { width: 36px; flex: none; }
.msg-body { display: flex; flex-direction: column; align-items: flex-start; max-width: min(640px, 78%); }
.msg.own .msg-body { align-items: flex-end; }
.meta { display: flex; gap: 8px; align-items: baseline; font-size: 13px; margin-bottom: 3px; padding: 0 4px; }
.meta span { font-size: 11px; }

.bubble {
  background: var(--panel-2); padding: 8px 14px; border-radius: 18px; line-height: 1.45;
  word-break: break-word; border-top-left-radius: 6px;
}
.msg.grouped .bubble { border-top-left-radius: 18px; }
.bubble.own { background: var(--q-primary); color: #0b0b0b; border-top-left-radius: 18px; border-top-right-radius: 6px; }
.msg.grouped .bubble.own { border-top-right-radius: 18px; }
.bubble.mention { background: color-mix(in srgb, var(--mention) 18%, var(--panel)); box-shadow: inset 3px 0 0 var(--mention); }
.mention-tag { color: var(--mention); }
.bubble.own .mention-tag { color: inherit; text-decoration: underline; }
</style>
