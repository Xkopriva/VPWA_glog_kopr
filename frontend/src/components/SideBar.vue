<template>
  <div class="sidebar column no-wrap full-height" :class="{ solid: $q.screen.lt.md }">
    <!-- profil + stav -->
    <div v-if="me" class="panel q-pa-md">
      <div class="row items-center no-wrap">
        <div class="relative-position">
          <q-avatar size="46px"><img :src="`https://cdn.quasar.dev/img/avatar${(me.id % 6) + 1}.jpg`" /></q-avatar>
          <span class="status-dot" :class="`bg-${statusColor[me.status]}`" />
        </div>
        <div class="q-ml-md ellipsis">
          <div class="text-weight-bold ellipsis">{{ me.firstName }} {{ me.lastName }}</div>
          <div class="text-caption dim">@{{ me.nickName }}</div>
        </div>
      </div>
      <q-btn no-caps unelevated class="soft full-width q-mt-md" align="left">
        <q-icon name="circle" :color="statusColor[me.status]" size="12px" class="q-mr-sm" />
        {{ statusLabel[me.status] }}
        <q-space /><q-icon name="expand_more" />
        <q-menu auto-close>
          <q-list style="min-width: 200px">
            <q-item v-for="o in statusOptions" :key="o.value" clickable @click="setStatus(o.value)">
              <q-item-section avatar><q-icon name="circle" :color="statusColor[o.value]" size="12px" /></q-item-section>
              <q-item-section>{{ o.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div v-else class="panel q-pa-md dim">Not logged in.</div>

    <!-- knižnica kanálov -->
    <div v-if="me" class="panel col column no-wrap q-pa-sm library">
      <div class="row items-center q-px-sm q-pt-xs q-pb-sm">
        <div class="text-subtitle1 text-weight-bold">Channels</div>
        <q-space />
        <q-btn round flat dense icon="add" @click="createDlg = true"><q-tooltip>Create channel</q-tooltip></q-btn>
      </div>

      <div class="seg q-mx-sm q-mb-sm">
        <button :class="{ on: listType === 'public' }" @click="listType = 'public'">Public · {{ count('public') }}</button>
        <button :class="{ on: listType === 'private' }" @click="listType = 'private'">Private · {{ count('private') }}</button>
      </div>

      <q-scroll-area class="col">
        <q-list class="q-px-xs">
          <!-- pozvánky: zvýraznené a topované -->
          <div v-for="{ channel: c } in invites" :key="'inv' + c.id" class="invite bg-yellow-8 text-dark q-pa-sm q-mb-sm">
            <div class="row items-center no-wrap">
              <ChannelTile :name="c.name" :type="c.type" :size="40" />
              <div class="q-ml-md ellipsis">
                <div class="text-weight-bold ellipsis">{{ c.name }}</div>
                <div class="text-caption">Invitation · {{ c.type }}</div>
              </div>
            </div>
            <div class="row q-gutter-sm q-mt-sm">
              <q-btn class="col" unelevated no-caps dense color="primary" label="Accept" @click="accept(c.id)" />
              <q-btn class="col" flat no-caps dense label="Decline" @click="declineInvite(c.id)" />
            </div>
          </div>

          <div v-if="!items.length && !invites.length" class="text-center dim q-pa-lg">
            No {{ listType }} channels yet.<br />Use <b>+</b> or <code>/join name</code>
          </div>

          <q-item
            v-for="{ channel: c } in items"
            :key="c.id"
            clickable
            class="ch-row"
            :to="{ path: '/chatting', query: { c: c.id } }"
            :active="state.activeChannelId === c.id"
            active-class="ch-active"
          >
            <q-item-section avatar style="min-width: 0; padding-right: 12px"><ChannelTile :name="c.name" :type="c.type" /></q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium ellipsis">{{ c.name }}</q-item-label>
              <q-item-label v-if="daysLeft(c) <= 7" caption class="text-negative">expires in {{ daysLeft(c) }} d (inactive)</q-item-label>
              <q-item-label v-else caption>{{ c.members.length }} members<template v-if="isAdmin(c)"> · Admin</template></q-item-label>
            </q-item-section>
            <q-item-section side><q-badge v-if="state.unread[c.id]" color="negative" rounded :label="state.unread[c.id]" /></q-item-section>
            <q-item-section side>
              <q-btn flat dense round size="sm" icon="more_horiz" @click.stop.prevent>
                <q-menu auto-close>
                  <q-list dense style="min-width: 210px">
                    <q-item clickable @click="leave(c)">
                      <q-item-section>{{ isAdmin(c) ? 'Leave & delete (/cancel)' : 'Leave channel (/cancel)' }}</q-item-section>
                    </q-item>
                    <q-item v-if="isAdmin(c)" clickable class="text-negative" @click="remove(c)">
                      <q-item-section>Delete channel (/quit)</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>

          <q-expansion-item v-if="listType === 'public' && discoverable.length" label="Discover public channels" dense-toggle class="q-mt-sm" header-class="text-weight-medium">
            <q-item v-for="c in discoverable" :key="c.id" class="ch-row">
              <q-item-section avatar style="min-width: 0; padding-right: 12px"><ChannelTile :name="c.name" :type="c.type" :size="36" /></q-item-section>
              <q-item-section>{{ c.name }}<q-item-label caption>{{ c.members.length }} members</q-item-label></q-item-section>
              <q-item-section side><q-btn unelevated dense no-caps color="primary" label="Join" class="q-px-md" @click="run(`/join ${c.name}`)" /></q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </div>

    <q-dialog v-model="createDlg">
      <q-card style="min-width: 340px" class="q-pa-sm">
        <q-card-section class="text-h6">New channel</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="newName" autofocus outlined rounded label="channelName" lazy-rules
            :rules="[(v: string) => /^[\w-]{2,24}$/.test(v) || '2–24 chars: letters, digits, -, _']" @keyup.enter="create" />
          <q-toggle v-model="newPrivate" label="Private channel" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn unelevated no-caps color="primary" label="Create" class="q-px-lg" @click="create" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify, useQuasar } from 'quasar';
import ChannelTile from '@/components/ChannelTile.vue';
import { useChat, type Channel, type Result, type Status } from '@/stores/chat';

const { state, me, sidebarChannels, discoverable, daysLeft, isAdmin, setStatus, declineInvite, acceptInvite, cancelMembership, quitChannel, execute } = useChat();
const $q = useQuasar();
const router = useRouter();

const listType = ref<'public' | 'private'>('public');
const invites = computed(() => sidebarChannels.value.filter((x) => x.invited));
const items = computed(() => sidebarChannels.value.filter((x) => !x.invited && x.channel.type === listType.value));
const count = (t: 'public' | 'private') => sidebarChannels.value.filter((x) => !x.invited && x.channel.type === t).length;

const statusOptions: { label: string; value: Status }[] = [
  { label: 'Online', value: 'online' },
  { label: 'Do not disturb (DND)', value: 'dnd' },
  { label: 'Offline', value: 'offline' },
];
const statusLabel = { online: 'Online', dnd: 'Do not disturb', offline: 'Offline' } as const;
const statusColor = { online: 'positive', dnd: 'negative', offline: 'grey' } as const;
const createDlg = ref(false);
const newName = ref('');
const newPrivate = ref(false);

function handle(r: Result) {
  if (r.message) Notify.create({ type: r.ok ? 'positive' : 'negative', message: r.message });
  if (r.ok && r.goTo) void router.push({ path: '/chatting', query: { c: r.goTo } });
}
const run = (cmd: string) => handle(execute(cmd));
const accept = (id: number) => handle(acceptInvite(id));
function create() {
  if (!/^[\w-]{2,24}$/.test(newName.value)) return;
  handle(execute(`/join ${newName.value}${newPrivate.value ? ' private' : ''}`));
  createDlg.value = false; newName.value = ''; newPrivate.value = false;
}
const confirm = (title: string, message: string, fn: () => Result) => $q.dialog({ title, message, cancel: true }).onOk(() => handle(fn()));
const leave = (c: Channel) => confirm('Leave channel', isAdmin(c) ? 'You are the admin – the channel will be deleted.' : `Leave #${c.name}?`, () => cancelMembership(c.id));
const remove = (c: Channel) => confirm('Delete channel', `Delete #${c.name}? Messages will be lost.`, () => quitChannel(c.id));
</script>

<style scoped>
.sidebar { padding: 0 4px 8px 8px; gap: 8px; }
.sidebar.solid { background: var(--bg); padding: 8px; }
.status-dot { position: absolute; right: -1px; bottom: -1px; width: 13px; height: 13px; border-radius: 50%; border: 2px solid var(--panel); }
.invite { border-radius: 16px; box-shadow: 0 2px 10px rgba(249, 168, 37, 0.45); }
.library { min-height: 0; }
</style>
