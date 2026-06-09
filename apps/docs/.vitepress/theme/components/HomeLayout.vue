<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import HeroGraph from './HeroGraph.vue';
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-before>
      <ClientOnly>
        <HeroGraph />
      </ClientOnly>
    </template>
  </DefaultTheme.Layout>
</template>
