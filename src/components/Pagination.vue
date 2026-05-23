<script setup lang="ts" generic="TData">
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "@lucide/vue";

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";

import type { Table } from "@tanstack/vue-table";

import { cn } from "@/lib/utils";

interface IProps<TData> {
  pageSizes: number[];
  table: Table<TData>;
}

defineProps<IProps<TData>>();
</script>

<template>
  <section class="dark:bg-card flex items-center justify-end gap-2 p-5 md:gap-5">
    <Select
      :model-value="table.getState().pagination.pageSize"
      @update:model-value="(e) => table.setPageSize(Number(e))"
    >
      <SelectTrigger class="text-muted-foreground text-xs" size="default">
        <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
        <SelectContent class="w-16.25 min-w-px" @close-auto-focus.prevent>
          <SelectGroup class="[&_svg]:h-4 [&_svg]:w-4">
            <SelectItem
              class="justify-between text-xs"
              v-for="pageSize in pageSizes"
              :key="pageSize"
              :value="`${pageSize}`"
            >
              {{ pageSize }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </SelectTrigger>
    </Select>
    <div :class="cn('flex items-center space-x-2')">
      <template v-if="table.getPageCount() > 1">
        <Button :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)" size="icon" variant="secondary">
          <ArrowLeft />
        </Button>
        <Button :disabled="!table.getCanPreviousPage()" @click="table.previousPage()" size="icon" variant="secondary">
          <ChevronLeft />
        </Button>
      </template>
      <span class="text-muted-foreground px-1 text-xs">
        {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
      </span>
      <template v-if="table.getPageCount() > 1">
        <Button :disabled="!table.getCanNextPage()" @click="table.nextPage()" size="icon" variant="secondary">
          <ChevronRight />
        </Button>
        <Button
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
          size="icon"
          variant="secondary"
        >
          <ArrowRight />
        </Button>
      </template>
    </div>
  </section>
</template>
