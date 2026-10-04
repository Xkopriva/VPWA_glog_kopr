<template>
  <q-page class="row">
    <!-- Left side of main block -->
    <div class="col-2">
      <SideBar />
    </div>

    <!-- Right side of main block -->
    <div class="col-10 column justify-between">
      <!-- Middle part, register and login forms -->
      <div class="col row flex-center q-gutter-x-lg q-px-md">
        <LoginForm class="col-12 col-md-5" />
        <RegisterForm class="col-12 col-md-5" />
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
import LoginForm from '../../components/LoginForm.vue';
</script>