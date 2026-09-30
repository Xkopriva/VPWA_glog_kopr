<template>
  <div>
    <div>LOGO</div>
    <div>Server List</div>
    <q-scroll-area style="height: 200px;">
      <q-list>
        <q-item v-for="n in 7" :key="n" clickable v-ripple>
          <q-item-section>Server name {{ n }}</q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts"></script>