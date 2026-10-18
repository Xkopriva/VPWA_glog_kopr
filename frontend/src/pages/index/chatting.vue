<template>
  <q-page :style-fn="(offset: number) => ({ height: `calc(100vh - ${offset}px)` })" style="padding: 0 8px 8px 8px">
    <div class="panel fit relative-position" style="overflow: hidden">
      <ChattingWindow />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChattingWindow from '@/components/ChattingWindow.vue';
import { useChat } from '@/stores/chat';

const { activeChannel, setActive } = useChat(); const route = useRoute(); const router = useRouter();
watch(() => route.query.c, (id) => setActive(Number(id)), { immediate: true });
// kanál zanikol / používateľ bol vyhodený / opustil kanál -> návrat na prehľad
watch(activeChannel, (c) => { if (!c) void router.replace('/landing-logged'); }, { immediate: true });
onBeforeUnmount(() => setActive(null));
</script>
