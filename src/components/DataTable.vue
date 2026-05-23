<script setup lang="ts" generic="TData, TValue">
import { Pagination } from "@/components";
import { SearchInput } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import { computed, h, ref } from "vue";
import {
  getCoreRowModel,
  useVueTable,
  FlexRender,
  type ColumnDef,
  getPaginationRowModel,
  type PaginationState,
  type SortingState,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/vue-table";

interface IProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  loading?: boolean;
  options?: ITableOptions;
  pageSizes?: number[];
}

const props = withDefaults(defineProps<IProps<TData, TValue>>(), {
  defaultPageSize: 5,
  defaultSorting: () => [],
  loading: false,
  pageSizes: () => [5, 10, 20, 50],
});

const globalFilter = ref<string>("");
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: props.defaultPageSize,
});
const sorting = ref<SortingState>(props.defaultSorting);

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
  state: {
    get globalFilter() {
      return globalFilter.value;
    },
    get pagination() {
      return pagination.value;
    },
    get sorting() {
      return sorting.value;
    },
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === "function" ? updater(globalFilter.value) : updater;
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === "function" ? updater(pagination.value) : updater;
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),

  globalFilterFn: "includesString",
});
</script>

<script lang="ts">
export interface ITableOptions {
  columnSearch?: boolean;
  globalSearch?: boolean;
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex items-center justify-end gap-5">
      <SearchInput
        v-if="options?.columnSearch"
        :value="globalFilter"
        :on-change="(v: string | number) => table.setGlobalFilter(v)"
        :on-clear="
          () => {
            table.setGlobalFilter('');
            globalFilter = '';
          }
        "
      />
    </div>
    <Table className="dark:bg-card table-fixed" style="width: 100%">
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
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="`${headerGroup.id}-filters`"
          class="bg-card hover:bg-card"
        >
          <TableHead
            v-if="options?.columnSearch"
            v-for="(header, index) in headerGroup.headers"
            :key="`${header.id}-filter`"
            class="overflow-hidden border-r py-1.5 last:border-none"
            :style="{
              minWidth: header.column.columnDef.minSize,
              width: index === headerGroup.headers.length - 1 ? 'auto' : `calc(var(--header-${header.id}-size) * 1px)`,
              maxWidth: index === headerGroup.headers.length - 1 ? undefined : header.column.columnDef.maxSize,
            }"
          >
            <SearchInput
              v-if="header.column.getCanFilter()"
              :value="(header.column.getFilterValue() as string) ?? ''"
              :on-change="(v) => header.column.setFilterValue(v)"
              :on-clear="() => header.column.setFilterValue('')"
              size="sm"
              class="w-35"
            />
          </TableHead>
        </TableRow>
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
    <Pagination v-if="!loading" :table="table" :page-sizes="pageSizes" />
  </section>
</template>
