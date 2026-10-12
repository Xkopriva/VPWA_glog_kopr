<template>
  <q-page class="row flex-center q-pa-md q-col-gutter-lg">
    <LoginForm class="col-12 col-md-5" />
    <RegisterForm class="col-12 col-md-5" />
  </q-page>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue';
import LoginForm from '@/components/LoginForm.vue';
</script>
