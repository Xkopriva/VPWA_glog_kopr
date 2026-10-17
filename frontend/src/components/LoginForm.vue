<template>
  <div>
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="bg-primary text-white text-center rounded-borders q-mb-lg">
        <div class="text-h4 text-bold">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input v-model="form.email" label="Email / Nickname" outlined dense :rules="[req]" lazy-rules />
          <q-input v-model="form.password" label="Password" type="password" outlined dense :rules="[req]" lazy-rules />
          <div class="text-caption text-grey">Demo: <b>jana</b> / <b>1234</b></div>

          <div class="row flex-center q-mt-lg">
            <q-btn type="submit" label="LOGIN" color="yellow-8" size="lg" class="full-width" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { useChat } from '@/stores/chat';

const router = useRouter();
const { login, requestNotifyPermission } = useChat();
const req = (v: string) => !!v || 'Required';

const form = ref({
  email: '',
  password: '',
});

function onSubmit() {
  const r = login(form.value.email, form.value.password);
  Notify.create({ type: r.ok ? 'positive' : 'negative', message: r.message });
  if (r.ok) {
    requestNotifyPermission();
    // routing to logged page
    void router.push('/landing-logged');
  }
}
</script>
