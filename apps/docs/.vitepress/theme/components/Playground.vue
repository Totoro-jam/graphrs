<script setup lang="ts">
import { Sandpack } from 'sandpack-vue3';
import { useData } from 'vitepress';
import { computed } from 'vue';

const props = defineProps<{ code: string }>();
const { isDark } = useData();

const files = computed(() => ({
  '/src/index.ts': props.code.trim(),
}));

const customSetup = {
  dependencies: { '@graphrs/core': '^0.2.0' },
};
</script>

<template>
  <div class="playground-wrapper">
    <Sandpack
      template="vanilla-ts"
      :theme="isDark ? 'dark' : 'light'"
      :files="files"
      :custom-setup="customSetup"
      :options="{
        showConsole: true,
        showConsoleButton: true,
        editorHeight: 320,
      }"
    />
  </div>
</template>

<style scoped>
.playground-wrapper {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
