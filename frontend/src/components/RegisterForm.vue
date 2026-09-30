<template>
  <div class="col-6">
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="bg-primary text-white text-center rounded-borders q-mb-lg">
        <div class="text-h4 text-bold">REGISTER</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input v-model="form.nickname" label="Nickname" outlined dense />
          <q-input v-model="form.email" label="Email" type="email" outlined dense />
          <q-input v-model="form.name" label="Name" outlined dense />
          <q-input v-model="form.surname" label="Surname" outlined dense />

          <div class="row flex-center q-mt-lg">
            <q-btn type="submit" label="REGISTER" color="primary" size="lg" class="full-width" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    
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