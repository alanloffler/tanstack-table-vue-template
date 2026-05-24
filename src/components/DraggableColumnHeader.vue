<script setup lang="ts" generic="TData, TValue">
import { FlexRender, type Header } from "@tanstack/vue-table";
import { ref } from "vue";
import { useSortable } from "@dnd-kit/vue/sortable";

import { TableHead } from "@/components/ui/table";

interface IProps {
  header: Header<TData, TValue>;
  index: number;
  isLastColumn?: boolean;
}

const props = defineProps<IProps>();

const el = ref<HTMLElement>();
const handleEl = ref<HTMLElement | null>(null);

const { isDragging } = useSortable({
  id: () => props.header.column.id,
  index: () => props.index,
  element: el,
  handle: handleEl,
});
</script>

<template>
  <TableHead
    ref="el"
    class="relative overflow-hidden py-2.5"
    :style="{
      minWidth: header.column.columnDef.minSize,
      width: isLastColumn ? 'auto' : `calc(var(--header-${header.id}-size) * 1px)`,
      maxWidth: isLastColumn ? undefined : header.column.columnDef.maxSize,
      opacity: isDragging ? 0.5 : 1,
    }"
  >
    <span v-if="!header.isPlaceholder" ref="handleEl" class="inline-flex w-fit cursor-grab active:cursor-grabbing">
      <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
    </span>
  </TableHead>
</template>
