<template>
  <q-page class="row">
    <!-- Left side of main block -->
    <SideBar />

    <!-- Right side of main block -->
    <div class="col-9 column justify-between">
      <!-- Form in the middle -->
      <div class="col row flex-center">
        <RegisterForm />
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
import RegisterForm from '../../components/RegisterForm.vue';
</script>