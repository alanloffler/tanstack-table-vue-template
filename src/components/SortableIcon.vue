<script setup lang="ts">
import { ChevronDown, ChevronsUpDown, ChevronUp } from "@lucide/vue";

import type { Column } from "@tanstack/vue-table";

interface IProps {
  column: Column<any, any>;
}

defineProps<IProps>();
</script>

<template>
  <button
    class="hover:bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded"
    @pointerdown="(e) => e.stopPropagation()"
    @click="() => column.toggleSorting(column.getIsSorted() === 'asc')"
  >
    <template v-if="column.getIsSorted() === 'asc'">
      <ChevronUp class="h-4 w-4 opacity-70" strokeWidth="1" />
    </template>
    <template v-else-if="column.getIsSorted() === 'desc'">
      <ChevronDown class="h-4 w-4 opacity-70" strokeWidth="1" />
    </template>
    <template v-else>
      <ChevronsUpDown class="h-4 w-4 opacity-70" strokeWidth="1" />
    </template>
  </button>
</template>
