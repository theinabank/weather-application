<template>
  <div>
    <MainHeader></MainHeader>
    <div class="container mx-auto px-4">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
  import MainHeader from '~/components/MainHeader.vue';
</script>
