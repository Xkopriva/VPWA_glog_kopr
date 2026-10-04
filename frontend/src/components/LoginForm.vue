<template>
  <div>
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="bg-primary text-white text-center rounded-borders q-mb-lg">
        <div class="text-h4 text-bold">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input v-model="form.email" label="Email" type="email" outlined dense />
          <q-input v-model="form.password" label="Password" type="password" outlined dense />

          <div class="row flex-center q-mt-lg">
            <q-btn type="submit" label="LOGIN" color="primary" size="lg" class="full-width" />
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
  email: '',
  password: '',
});

function onSubmit() {
  // routing to logged page
  void router.push('/landing-logged');
}
</script>