<template>
  <q-page class="row">
    <!-- Left side of main block -->
    <!-- <div class="col-2"> -->
      <SideBar />
    <!-- </div> -->

    <!-- Right side of main block -->
    <div class="col-9 column justify-between">
      <!-- Command line at the top -->
      <div class="col row flex-center">
        <CommandLine />
      </div>

      <!-- Log out button at the bottom -->
      <div class="row flex-center q-mb-md">
        <q-btn label="LOG OUT" color="negative" to="/landing" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import SideBar from '../../components/SideBar.vue';
import CommandLine from '../../components/CommandLine.vue';
</script>