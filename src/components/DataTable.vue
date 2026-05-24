<script setup lang="ts" generic="TData, TValue">
import { Columns3Cog, GripVertical, RefreshCcw } from "@lucide/vue";

import { Checkbox } from "@/components/ui/checkbox";
import { DraggableColumnHeader } from "@/components";
import { Pagination } from "@/components";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchInput } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { buttonVariants } from "@/components/ui/button";
import { computed, h, ref, watch } from "vue";
import { DragDropProvider, DragOverlay, type DragEndEvent } from "@dnd-kit/vue";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useVueTable,
} from "@tanstack/vue-table";

import { cn } from "@/lib/utils";
import { useTableStore } from "@/stores/table.store";

interface IProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  loading?: boolean;
  options?: ITableOptions;
  pageSizes?: number[];
  storageKey?: string;
}

const props = withDefaults(defineProps<IProps<TData, TValue>>(), {
  defaultPageSize: 5,
  defaultSorting: () => [],
  loading: false,
  pageSizes: () => [5, 10, 20, 50],
});

const tableStore = useTableStore();

const columnOrder = ref<string[]>(props.storageKey ? (tableStore.tables[props.storageKey]?.columnOrder ?? []) : []);
const columnVisibility = ref(props.storageKey ? (tableStore.tables[props.storageKey]?.columnVisibility ?? {}) : {});
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
  defaultColumn: { minSize: 40 },

  get data() {
    return tableData.value;
  },
  get columns() {
    return tableColumns.value;
  },
  state: {
    get columnOrder() {
      return columnOrder.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
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
  onColumnOrderChange: (updater) => {
    columnOrder.value = typeof updater === "function" ? updater(columnOrder.value) : updater;
    if (props.storageKey) tableStore.setColumnOrder(props.storageKey, columnOrder.value);
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value = typeof updater === "function" ? updater(columnVisibility.value) : updater;
    if (props.storageKey) tableStore.setColumnVisibility(props.storageKey, columnVisibility.value);
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

watch(
  () => (props.storageKey ? tableStore.tables[props.storageKey]?.columnVisibility : undefined),
  (val) => {
    if (props.storageKey) columnVisibility.value = val ?? {};
  },
);

watch(
  () => (props.storageKey ? tableStore.tables[props.storageKey]?.columnOrder : undefined),
  (val) => {
    if (props.storageKey) columnOrder.value = val ?? [];
  },
);

function handleDragEnd(event: DragEndEvent) {
  const { source, target } = event.operation;
  if (!source || !target || source.id === target.id) return;

  const columnIds = table.getAllLeafColumns().map((c) => c.id);
  const oldIndex = columnIds.indexOf(source.id as string);
  const newIndex = columnIds.indexOf(target.id as string);
  if (oldIndex === -1 || newIndex === -1) return;

  const newOrder = [...columnIds];
  const [moved] = newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, moved);
  table.setColumnOrder(newOrder);
}
</script>

<script lang="ts">
export interface ITableOptions {
  columnOrder?: boolean;
  columnSearch?: boolean;
  globalSearch?: boolean;
  hideColumns?: boolean;
  simulateAsync?: boolean;
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex items-center justify-end gap-5">
      <div class="flex items-center gap-2">
        <TooltipProvider v-if="options?.hideColumns">
          <Tooltip>
            <TooltipTrigger
              :class="cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'text-muted-foreground hover:bg-muted')"
              @click="() => tableStore.clearTable(storageKey!)"
            >
              <RefreshCcw />
            </TooltipTrigger>
            <TooltipContent>Resetear tabla</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Popover v-if="options?.hideColumns">
          <PopoverAnchor asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger
                    :class="
                      cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'text-muted-foreground hover:bg-muted')
                    "
                  >
                    <Columns3Cog />
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Seleccionar columnas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PopoverAnchor>
          <PopoverContent class="max-h-50 w-fit overflow-y-auto">
            <label v-for="column in table.getAllLeafColumns()" :key="column.id" class="flex items-center gap-2 text-sm">
              <Checkbox
                :model-value="column.getIsVisible()"
                @update:model-value="(checked: boolean | 'indeterminate') => column.toggleVisibility(!!checked)"
              />
              {{ column.id }}
            </label>
          </PopoverContent>
        </Popover>
      </div>
      <SearchInput
        v-if="options?.globalSearch"
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
    <DragDropProvider @drag-end="handleDragEnd">
      <Table className="dark:bg-card table-fixed" style="width: 100%">
        <TableHeader class="dark:bg-primary-foreground/50 bg-neutral-100">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <template v-for="(header, index) in headerGroup.headers" :key="header.id">
              <DraggableColumnHeader v-if="options?.columnOrder" :header="header" :index="index" />
              <TableHead v-else class="relative overflow-hidden py-2.5">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </template>
          </TableRow>
          <TableRow
            v-if="options?.columnSearch"
            v-for="headerGroup in table.getHeaderGroups()"
            :key="`${headerGroup.id}-filters`"
            class="bg-card hover:bg-card"
          >
            <TableHead
              v-for="(header, index) in headerGroup.headers"
              :key="`${header.id}-filter`"
              class="overflow-hidden border-r py-1.5 last:border-none"
              :style="{
                minWidth: header.column.columnDef.minSize,
                width:
                  index === headerGroup.headers.length - 1 ? 'auto' : `calc(var(--header-${header.id}-size) * 1px)`,
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
      <DragOverlay>
        <template #default="{ source }">
          <div
            class="bg-background flex min-h-10.5 w-fit items-center gap-2 rounded-md border px-2 py-1 pr-4 text-sm shadow-lg"
          >
            <GripVertical class="text-muted-foreground h-4 w-4" />
            {{ source.id }}
          </div>
        </template>
      </DragOverlay>
    </DragDropProvider>
    <Pagination v-if="!loading" :table="table" :page-sizes="pageSizes" />
  </section>
</template>
