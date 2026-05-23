<script setup lang="ts" generic="TData, TValue">
import { getCoreRowModel, useVueTable, FlexRender, type ColumnDef } from "@tanstack/vue-table";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface IProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
}

const props = defineProps<IProps<TData, TValue>>();

const table = useVueTable({
  get data() {
    return props.data ?? [];
  },
  get columns() {
    return props.columns ?? [];
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
