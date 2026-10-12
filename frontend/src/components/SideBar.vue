<template>
  <div class="column no-wrap full-height q-pa-sm">
    <!-- profil + stav -->
    <div v-if="me" class="q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
      <div class="row items-center no-wrap q-mb-sm">
        <q-avatar size="40px"><img :src="`https://cdn.quasar.dev/img/avatar${(me.id % 6) + 1}.jpg`" /></q-avatar>
        <div class="q-ml-sm ellipsis">
          <div class="text-weight-bold ellipsis">{{ me.firstName }} {{ me.lastName }}</div>
          <div class="text-caption text-grey">@{{ me.nickName }}</div>
        </div>
      </div>
      <q-select dense outlined emit-value map-options label="Status" :model-value="me.status" :options="statusOptions" @update:model-value="setStatus">
        <template #prepend><q-icon name="circle" :color="statusColor[me.status]" size="xs" /></template>
      </q-select>
    </div>
    <div v-else class="q-pa-sm text-grey">Not logged in.</div>

    <template v-if="me">
      <!-- prepínač private / public -->
      <q-btn
        class="text-subtitle1 text-center q-pa-sm q-my-md full-width"
        :color="isPrivate ? 'primary' : 'secondary'"
        :label="isPrivate ? 'Private Channel List' : 'Public Channel List'"
        no-caps
        @click="isPrivate = !isPrivate"
      />
      <q-btn class="q-mb-sm full-width" outline color="primary" icon="add" label="Create channel" no-caps @click="createDlg = true" />

      <!-- scrollable area s kanálmi -->
      <q-scroll-area class="col">
        <q-list>
          <q-item v-if="!items.length && !invites.length" class="text-grey">
            <q-item-section>No {{ isPrivate ? 'private' : 'public' }} channels. Use + or /join.</q-item-section>
          </q-item>

          <!-- pozvánky: zvýraznené a topované -->
          <q-item v-for="{ channel: c } in invites" :key="'inv' + c.id" class="bg-amber-3 text-dark text-weight-bold q-mb-xs rounded-borders">
            <q-item-section avatar><q-icon name="mail" color="deep-orange" /></q-item-section>
            <q-item-section>
              <q-item-label>{{ c.name }}</q-item-label>
              <q-item-label caption class="text-dark">Invitation ({{ c.type }})</q-item-label>
            </q-item-section>
            <q-item-section side class="row no-wrap">
              <q-btn flat dense round icon="check" color="positive" @click="accept(c.id)" />
              <q-btn flat dense round icon="close" color="negative" @click="declineInvite(c.id)" />
            </q-item-section>
          </q-item>

          <q-item
            v-for="{ channel: c } in items"
            :key="c.id"
            clickable
            :to="{ path: '/chatting', query: { c: c.id } }"
            :active="state.activeChannelId === c.id"
            active-class="text-primary text-weight-bold"
          >
            <q-item-section avatar><q-icon :name="c.type === 'private' ? 'lock' : 'tag'" /></q-item-section>
            <q-item-section>
              <q-item-label>
                {{ c.name }}
                <q-icon v-if="isAdmin(c)" name="star" color="amber" size="xs"><q-tooltip>You are the admin</q-tooltip></q-icon>
              </q-item-label>
              <q-item-label v-if="daysLeft(c) <= 7" caption class="text-negative">expires in {{ daysLeft(c) }} d (inactive)</q-item-label>
            </q-item-section>
            <q-item-section side><q-badge v-if="state.unread[c.id]" color="negative" rounded :label="state.unread[c.id]" /></q-item-section>
            <q-item-section side>
              <q-btn flat dense round size="sm" icon="more_vert" @click.stop.prevent>
                <q-menu auto-close>
                  <q-list dense style="min-width: 200px">
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

          <q-expansion-item v-if="!isPrivate && discoverable.length" icon="explore" label="Browse public channels" dense-toggle class="q-mt-sm">
            <q-item v-for="c in discoverable" :key="c.id">
              <q-item-section avatar><q-icon name="tag" /></q-item-section>
              <q-item-section>{{ c.name }}<q-item-label caption>{{ c.members.length }} members</q-item-label></q-item-section>
              <q-item-section side><q-btn flat dense color="primary" label="Join" no-caps @click="run(`/join ${c.name}`)" /></q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </template>

    <q-dialog v-model="createDlg">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">New channel</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="newName" autofocus outlined label="channelName" lazy-rules
            :rules="[(v: string) => /^[\w-]{2,24}$/.test(v) || '2–24 chars: letters, digits, -, _']" @keyup.enter="create" />
          <q-toggle v-model="newPrivate" label="Private channel" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" @click="create" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify, useQuasar } from 'quasar';
import { useChat, type Channel, type Result } from '@/stores/chat';

const { state, me, sidebarChannels, discoverable, daysLeft, isAdmin, setStatus, declineInvite, acceptInvite, cancelMembership, quitChannel, execute } = useChat();
const $q = useQuasar();
const router = useRouter();

// isPrivate values: true = private, false = public
const isPrivate = ref(false);
const type = computed(() => (isPrivate.value ? 'private' : 'public'));
const invites = computed(() => sidebarChannels.value.filter((x) => x.invited));
const items = computed(() => sidebarChannels.value.filter((x) => !x.invited && x.channel.type === type.value));

const statusOptions = [{ label: 'Online', value: 'online' }, { label: 'Do not disturb (DND)', value: 'dnd' }, { label: 'Offline', value: 'offline' }];
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
