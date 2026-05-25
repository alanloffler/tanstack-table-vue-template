<script setup lang="ts" generic="TData, TValue">
import { TableHead } from "@/components/ui/table";

import { FlexRender, type Header } from "@tanstack/vue-table";
import { ref } from "vue";
import { useSortable } from "@dnd-kit/vue/sortable";

import { cn } from "@/lib/utils";

interface IProps {
  columnSizing?: boolean;
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
    <div
      v-if="!isLastColumn && columnSizing"
      @dblclick="header.column.resetSize()"
      @mousedown.stop="header.getResizeHandler()($event)"
      @touchstart.stop="header.getResizeHandler()($event)"
      :class="
        cn(
          'hover:bg-primary/50 active:bg-primary absolute top-0 right-0 h-full w-0.75 cursor-col-resize touch-none bg-transparent transition-colors select-none',
          header.column.getIsResizing() && 'bg-primary',
        )
      "
    />
  </TableHead>
</template>
