// Channel Tile namiesto meniaceho buttony (public/private) v SideBar.vue, je to prepinac
<template>
  <div class="tile" :class="type" :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.42 + 'px' }">
    {{ name.charAt(0).toUpperCase() }}
    <q-icon v-if="type === 'private'" name="lock" class="lock" :size="size * 0.32 + 'px'" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ name: string; type: 'public' | 'private'; size?: number }>(), { size: 44 });
</script>

<style scoped>
.tile {
  position: relative; flex: none; display: flex; align-items: center; justify-content: center;
  border-radius: 28%; color: #fff; font-weight: 700; letter-spacing: 0.02em;
}
.tile.public { background: linear-gradient(135deg, var(--q-primary), color-mix(in srgb, var(--q-primary) 55%, #000)); }
.tile.private { background: linear-gradient(135deg, var(--q-secondary), color-mix(in srgb, var(--q-secondary) 55%, #000)); }
.lock { position: absolute; right: -4px; bottom: -4px; background: var(--panel); color: var(--q-secondary); border-radius: 50%; padding: 2px; }
</style>
