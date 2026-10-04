<template>
  <q-page class="row">
    <!-- Left side of main block -->
    <div class="col-2 full-height">
      <SideBar />
    </div>

    <!-- Right side of main block -->
    <div class="col-10 column full-height justify-between">
      <div class="col relative-position">
        <ChattingWindow />
      </div>

      <!-- CommandLine at the bottom -->
      <div>
        <CommandLine />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import SideBar from '../../components/SideBar.vue';
import CommandLine from '../../components/CommandLine.vue';
import ChattingWindow from '@/components/ChattingWindow.vue';
</script>