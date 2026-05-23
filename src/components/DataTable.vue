<script setup lang="ts" generic="TData, TValue">
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import { computed, h } from "vue";
import { getCoreRowModel, useVueTable, FlexRender, type ColumnDef } from "@tanstack/vue-table";

interface IProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  defaultPageSize?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<IProps<TData, TValue>>(), {
  defaultPageSize: 10,
  loading: false,
});

const tableData = computed<TData[]>(() => {
  if (props.loading) return Array(props.defaultPageSize).fill({}) as TData[];
  return props.data ?? [];
});

const tableColumns = computed(() => {
  if (props.loading) {
    return (props.columns ?? []).map((col) => ({
      ...col,
      cell: () => h(Skeleton, { class: "h-6 w-full" }),
    }));
  }
  return props.columns ?? [];
});

const table = useVueTable({
  get data() {
    return tableData.value;
  },
  get columns() {
    return tableColumns.value;
  },
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <Table className="dark:bg-card table-fixed">
    <TableHeader class="dark:bg-primary-foreground/50 bg-neutral-100">
      <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <TableHead v-for="header in headerGroup.headers" :key="header.id" class="relative overflow-hidden py-2.5">
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
        <TableCell
          v-for="cell in row.getVisibleCells()"
          :key="cell.id"
          class="overflow-hidden border-r whitespace-normal last:border-none"
        >
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </TableCell>
      </TableRow>
      <TableRow v-if="table.getRowModel().rows.length === 0">
        <TableCell :colSpan="columns?.length ?? 1" class="h-24 text-center"> Sin resultados </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
