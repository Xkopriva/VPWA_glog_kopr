<template>
  <!-- TODO: replace style="height: 100vh;" with custom class that sets that div to 100vh - it does 100% of viewport height -->
  <div class="col-2 column q-pa-sm" style="height: 94vh; border-style: none solid none none; border-color: DodgerBlue;">

    <q-btn class="text-h6 text-center q-pa-sm q-mx-sm q-my-lg no-pointer-events" color="primary" >Server List</q-btn>

    <!-- scrollable area with server names -->
    <q-scroll-area class="col" style="height: 100%;">
      <div class="column q-gutter-y-sm">
        <q-btn
          v-for="n in 7"
          :key="n"
          :label="`Server name ${n}`"
          :to="`/server${n}`"
          outline
          color="black"
          class="full-width"
        />
      </div>
    </q-scroll-area>
  </div>
</template>