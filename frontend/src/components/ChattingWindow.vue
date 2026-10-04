<template>
  <!-- TODO: replace style="height: 83vh;" with custom class that sets that div to 83vh - it does 83% of viewport height -->
  <div style="height: 83vh;">
    <q-scroll-area class="fit q-pa-md">
      <q-chat-message
      name="me"
      avatar="https://cdn.quasar.dev/img/avatar1.jpg"
      :text="['hey, how are you?']"
      stamp="7 minutes ago"
      sent
      bg-color="amber-7"
    />
    <q-chat-message
      name="Jane"
      avatar="https://cdn.quasar.dev/img/avatar5.jpg"
      :text="['doing fine, how r you?']"
      stamp="4 minutes ago"
      text-color="white"
      bg-color="primary"
    /><q-chat-message
      name="me"
      avatar="https://cdn.quasar.dev/img/avatar1.jpg"
      :text="['hey, how are you?']"
      stamp="7 minutes ago"
      sent
      bg-color="amber-7"
    />
    <q-chat-message
      name="Jane"
      avatar="https://cdn.quasar.dev/img/avatar5.jpg"
      :text="['doing fine, how r you?']"
      stamp="4 minutes ago"
      text-color="white"
      bg-color="primary"
    />      
    <q-chat-message
      name="me"
      avatar="https://cdn.quasar.dev/img/avatar3.jpg"
      :text="['hey, how are you?']"
      stamp="7 minutes ago"
      sent
      bg-color="amber-7"
    />
    <q-chat-message
      name="Jane"
      avatar="https://cdn.quasar.dev/img/avatar5.jpg"
      :text="[
        'doing fine, how r you?',
        'I just feel like typing a really, really, REALLY long message to annoy you...'
      ]"
      size="6"
      stamp="4 minutes ago"
      text-color="white"
      bg-color="primary"
    />
    <q-chat-message
      name="Jane"
      avatar="https://cdn.quasar.dev/img/avatar5.jpg"
      :text="['Did it work?']"
      stamp="1 minutes ago"
      size="8"
      text-color="white"
      bg-color="primary"
    />

    <q-chat-message
      name="me"
      avatar="https://cdn.quasar.dev/img/avatar3.jpg"
      stamp="7 minutes ago"
      sent
      text-color="white"
      bg-color="primary"
    >
      <div> Hey there! </div>

      <div>
        Have you seen Quasar?
      </div>
    </q-chat-message>

    <q-chat-message
      name="Jane"
      avatar="https://cdn.quasar.dev/img/avatar5.jpg"
      bg-color="amber"
    >
      <q-spinner-dots size="2rem" />
    </q-chat-message>
      
      
      
      
      <!-- Later do it like this -->
      <!-- <div v-for="(msg, index) in messages" :key="index"> -->
        <!-- <q-chat-message
          :name="msg.name"
          :avatar="msg.avatar"
          :text="[msg.text]"
          :stamp="msg.stamp"
          :sent="msg.sent"
          :bg-color="msg.sent ? 'primary' : 'grey-4'"
          :text-color="msg.sent ? 'white' : 'black'"
        /> -->
      <!-- </div> -->
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue';

// Later do it like this:
// const messages = ref([
//   {
//     name: 'Server Admin',
//     avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
//     text: 'INCOMING MESSAGE - Vítajte na serveri!',
//     stamp: '14:00',
//     sent: false, // Doľava
//   },
//   {
//     name: 'Ja',
//     avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
//     text: 'MY MESSAGE - Ahoj, diki!',
//     stamp: '14:01',
//     sent: true, // Doprava
//   },
//   {
//     name: 'Server Admin',
//     avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
//     text: 'INCOMING MESSAGE - Ako ti môžem pomôcť?',
//     stamp: '14:02',
//     sent: false,
//   },
//   {
//     name: 'Ja',
//     avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
//     text: 'MY MESSAGE - Skúšam Quasar chat rozhranie.',
//     stamp: '14:03',
//     sent: true,
//   },
//   {
//     name: 'Server Admin',
//     avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
//     text: 'INCOMING MESSAGE - Vítajte na serveri!',
//     stamp: '14:00',
//     sent: false, // Doľava
//   },
//   {
//     name: 'Ja',
//     avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
//     text: 'MY MESSAGE - Ahoj, diki!',
//     stamp: '14:01',
//     sent: true, // Doprava
//   },
// ]);
</script>