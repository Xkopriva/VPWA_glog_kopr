<template>
  <div>
    <div>REGISTER</div>
    <q-form @submit="onSubmit">
      <q-input v-model="form.nickname" label="Nickname" />
      <q-input v-model="form.email" label="Email" type="email" />
      <q-input v-model="form.name" label="Name" />
      <q-input v-model="form.surname" label="Surname" />
      
      <q-btn type="submit" label="REGISTER" color="primary" />
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
  nickname: '',
  email: '',
  name: '',
  surname: '',
});

function onSubmit() {
  // routing to logged page
  void router.push('/landing-logged');
}
</script>