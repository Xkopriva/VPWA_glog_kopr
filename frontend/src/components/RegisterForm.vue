<template>
  <div>
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="bg-primary text-white text-center rounded-borders q-mb-lg">
        <div class="text-h4 text-bold">REGISTER</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input v-model="form.nickname" label="Nickname" outlined dense lazy-rules
            :rules="[req, (v: string) => /^\w{2,20}$/.test(v) || 'Letters, digits, _ (2–20)']" />
          <q-input v-model="form.email" label="Email" type="email" outlined dense lazy-rules
            :rules="[req, (v: string) => /.+@.+\..+/.test(v) || 'Invalid email']" />
          <q-input v-model="form.name" label="Name" outlined dense :rules="[req]" lazy-rules />
          <q-input v-model="form.surname" label="Surname" outlined dense :rules="[req]" lazy-rules />
          <q-input v-model="form.password" label="Password" type="password" outlined dense lazy-rules
            :rules="[req, (v: string) => v.length >= 4 || 'At least 4 characters']" />

          <div class="row flex-center q-mt-lg">
            <q-btn type="submit" label="REGISTER" color="yellow-8" size="lg" class="full-width" />
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
const { register, requestNotifyPermission } = useChat();
const req = (v: string) => !!v || 'Required';

const form = ref({
  nickname: '',
  email: '',
  name: '',
  surname: '',
  password: '',
});

function onSubmit() {
  const f = form.value;
  const r = register({ firstName: f.name, lastName: f.surname, nickName: f.nickname, email: f.email, password: f.password });
  Notify.create({ type: r.ok ? 'positive' : 'negative', message: r.message });
  if (r.ok) {
    requestNotifyPermission();
    // routing to logged page
    void router.push('/landing-logged');
  }
}
</script>
