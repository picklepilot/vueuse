<script setup lang="ts">
import { ref } from 'vue'
import { useSortable } from '.'

const el = ref<HTMLElement | null>(null)
const list = ref([
  { id: 1, name: 'a', bgClass: 'bg-red-300' },
  { id: 2, name: 'b', bgClass: null },
  { id: 3, name: 'c', bgClass: null },
  { id: 4, name: 'd', bgClass: 'bg-indigo-300' },
  { id: 5, name: 'e', bgClass: null },
  { id: 6, name: 'f', bgClass: null },
  { id: 7, name: 'g', bgClass: null },
])

const listLarge = ref(
  Array.from(Array(1000).keys())
    .map(i => ({
      id: i + 1,
      name: crypto.randomUUID(),
    })),
)

const { option } = useSortable(el, list, {
  animation: 150,
  multiDrag: true,
  selectedClass: 'selected',
  handle: '.drag-handle',
})
</script>

<template>
  <button @click="option('animation', 150)">
    on animation
  </button>
  <button @click="option('animation', 0)">
    off animation
  </button>
  <div ref="el" class="flex flex-col gap-2 p-4 w-full h-500px m-auto bg-gray-500/5 rounded overflow-auto">
    <div v-for="(item, idx) in listLarge" :key="item.id" class="h20 bg-gray-500/5 rounded p-3 flex" :class="[item.bgClass || 'bg-gray-400']">
      <div class="drag-handle cursor-move px-2 py-1 text-sm bg-white rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="0.63em" height="1em" viewBox="0 0 320 512"><path fill="currentColor" d="M96 32H32C14.33 32 0 46.33 0 64v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32m0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32m0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32M288 32h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32m0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32m0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32" /></svg>
      </div>
      <strong>{{ item.name.toUpperCase() }}</strong>
      <input v-model="listLarge[idx].name" class="px-2 py-1 text-sm bg-white ml-3 rounded-md" @click.stop @focus.stop>
    </div>
  </div>
  <div v-if="false" class="mt-3 text-center">
    {{ JSON.stringify(list) }}
  </div>
</template>

<style scoped>
.selected {
  border: 1px solid blue;
}
</style>
