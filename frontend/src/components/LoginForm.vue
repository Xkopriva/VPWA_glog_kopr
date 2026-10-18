<template>
  <div>
    <q-card flat class="panel q-pa-lg" style="max-width: 460px; margin: 0 auto">
      <q-card-section class="hero text-center q-mb-lg q-py-lg">
        <div class="text-h4 text-bold">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input v-model="form.email" label="Email / Nickname" outlined rounded dense :rules="[req]" lazy-rules />
          <q-input v-model="form.password" label="Password" type="password" outlined rounded dense :rules="[req]" lazy-rules />
          <div class="text-caption text-grey">Demo: <b>jana</b> / <b>1234</b></div>

          <div class="row flex-center q-mt-lg">
            <q-btn type="submit" label="LOGIN" color="yellow-8" text-color="dark" unelevated no-caps size="lg" class="full-width text-weight-bold" />
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
    // routing na logged-in stránku (index/landing-logged)
    void router.push('/landing-logged');
  }
}
</script>
