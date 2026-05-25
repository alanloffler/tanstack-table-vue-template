<script setup lang="ts" generic="TData, TValue">
import { Columns3Cog, GripVertical, RefreshCcw } from "@lucide/vue";

import { Checkbox } from "@/components/ui/checkbox";
import { DraggableColumnHeader } from "@/components";
import { FilePdf } from "@/components/icons";
import { FileXls } from "@/components/icons";
import { Pagination } from "@/components";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchInput } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { buttonVariants } from "@/components/ui/button";
import { computed, h, onMounted, ref, watch } from "vue";
import { DragDropProvider, DragOverlay, type DragEndEvent } from "@dnd-kit/vue";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnSizingState,
  type PaginationState,
  type SortingState,
  useVueTable,
} from "@tanstack/vue-table";
import { isSortable } from "@dnd-kit/vue/sortable";

import { cn } from "@/lib/utils";
import { exportTableToPdf, type TPdfFormatter } from "@/utils/export-table-pdf.utils";
import { exportTableToXls, type TXlsFormatter } from "@/utils/export-table-xls.utils";
import { useTableStore } from "@/stores/table.store";

interface IProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  exportPdfConfig?: {
    filename?: string;
    formatters?: Record<string, TPdfFormatter<TData>>;
    title?: string;
  };
  exportXlsConfig?: {
    filename?: string;
    formatters?: Record<string, TXlsFormatter<TData>>;
    sheetName?: string;
  };
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
const columnSizing = ref<ColumnSizingState>(
  props.storageKey ? (tableStore.tables[props.storageKey]?.columnSizing ?? {}) : {},
);
const columnVisibility = ref(props.storageKey ? (tableStore.tables[props.storageKey]?.columnVisibility ?? {}) : {});
const containerRef = ref<HTMLElement | null>(null);
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
  columnResizeMode: "onChange",
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
    get columnSizing() {
      return columnSizing.value;
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
  onColumnSizingChange: (updater) => {
    columnSizing.value = typeof updater === "function" ? updater(columnSizing.value) : updater;
    if (props.storageKey) tableStore.setColumnSizing(props.storageKey, columnSizing.value);
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
  () => (props.storageKey ? tableStore.tables[props.storageKey]?.columnOrder : undefined),
  (val) => {
    if (props.storageKey) columnOrder.value = val ?? [];
  },
);

watch(
  () => (props.storageKey ? tableStore.tables[props.storageKey]?.columnSizing : undefined),
  (val) => {
    if (props.storageKey) columnSizing.value = val ?? {};
  },
);

watch(
  () => (props.storageKey ? tableStore.tables[props.storageKey]?.columnVisibility : undefined),
  (val) => {
    if (props.storageKey) columnVisibility.value = val ?? {};
  },
);

// Drag and drop
function handleDragEnd(event: DragEndEvent) {
  const { source } = event.operation;
  if (!isSortable(source)) return;

  const { initialIndex, index } = source;
  if (initialIndex === index) return;

  const allIds = table.getHeaderGroups().flatMap((hg) => hg.headers.map((h) => h.column.id));
  const draggable = draggableColumnIds.value.slice();
  const [moved] = draggable.splice(initialIndex, 1);
  draggable.splice(index, 0, moved);

  let d = 0;
  const newOrder = allIds.map((id) => (draggableColumnIds.value.includes(id) ? draggable[d++] : id));
  table.setColumnOrder(newOrder);
}

const draggableColumnIds = computed(() =>
  table
    .getHeaderGroups()
    .flatMap((hg) => hg.headers)
    .filter((h) => !h.column.columnDef.meta?.disableDragging)
    .map((h) => h.column.id),
);

// Column sizing
function computeDefaultSizing(): ColumnSizingState | null {
  const container = containerRef.value;
  if (!container) return null;
  const width = container.offsetWidth;
  if (width === 0) return null;
  const visibleCols = table.getAllLeafColumns().filter((c) => c.getIsVisible());
  if (visibleCols.length === 0) return null;
  const totalWeight = visibleCols.reduce((sum, c) => sum + (c.columnDef.size ?? 150), 0);
  const sizing: ColumnSizingState = {};
  visibleCols.forEach((c) => {
    sizing[c.id] = Math.floor(((c.columnDef.size ?? 150) / totalWeight) * width);
  });
  return sizing;
}

onMounted(() => {
  if (Object.keys(columnSizing.value).length > 0) return;
  const sizing = computeDefaultSizing();
  if (sizing && props.storageKey) tableStore.setColumnSizing(props.storageKey, sizing);
});

const isResizing = computed(() => !!table.getState().columnSizingInfo.isResizingColumn);

const columnSizeVars = computed(() => {
  const colSizes: Record<string, number> = {};
  for (const header of table.getFlatHeaders()) {
    colSizes[`--header-${header.id}-size`] = header.getSize();
    colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
  }
  return colSizes;
});

const visibleColumns = computed(() => table.getVisibleLeafColumns());

const tableMinWidth = computed(() => {
  const fixed = visibleColumns.value.slice(0, -1).reduce((sum, c) => sum + c.getSize(), 0);
  const lastMin = visibleColumns.value[visibleColumns.value.length - 1]?.columnDef.minSize ?? 40;
  return fixed + lastMin;
});
</script>

<script lang="ts">
export interface ITableOptions {
  columnOrder?: boolean;
  columnSearch?: boolean;
  columnSizing?: boolean;
  exportPdf?: boolean;
  exportXls?: boolean;
  globalSearch?: boolean;
  hideColumns?: boolean;
  showTooltips?: boolean;
  simulateAsync?: boolean;
}
</script>

<template>
  <section
    ref="containerRef"
    :class="cn('flex flex-col gap-3', isResizing && 'cursor-col-resize select-none')"
    :style="{ ...columnSizeVars, '--table-min-width': `${tableMinWidth}px` }"
  >
    <div class="flex items-center justify-end gap-5">
      <div class="flex items-center gap-2">
        <TooltipProvider v-if="options?.exportPdf" :disabled="!options?.showTooltips">
          <Tooltip>
            <TooltipTrigger
              :class="
                cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'text-muted-foreground hover:bg-muted')
              "
              @click="
                () =>
                  exportTableToPdf({
                    filename: exportPdfConfig?.filename,
                    formatters: exportPdfConfig?.formatters,
                    table,
                    title: exportPdfConfig?.title,
                  })
              "
            >
              <FilePdf class="size-5" />
            </TooltipTrigger>
            <TooltipContent>Exportar PDF</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="options?.exportXls" :disabled="!options?.showTooltips">
          <Tooltip>
            <TooltipTrigger
              :class="
                cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'text-muted-foreground hover:bg-muted')
              "
              @click="
                () =>
                  exportTableToXls({
                    filename: exportXlsConfig?.filename,
                    formatters: exportXlsConfig?.formatters,
                    sheetName: exportXlsConfig?.sheetName,
                    table,
                  })
              "
            >
              <FileXls class="size-5" />
            </TooltipTrigger>
            <TooltipContent>Exportar XLS</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="options?.columnOrder || options?.hideColumns" :disabled="!options?.showTooltips">
          <Tooltip>
            <TooltipTrigger
              :class="
                cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'text-muted-foreground hover:bg-muted')
              "
              @click="() => tableStore.clearTable(storageKey!)"
            >
              <RefreshCcw />
            </TooltipTrigger>
            <TooltipContent>Resetear tabla</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Popover v-if="options?.hideColumns">
          <PopoverAnchor asChild>
            <TooltipProvider :disabled="!options?.showTooltips">
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger
                    :class="
                      cn(
                        buttonVariants({ variant: 'outline', size: 'icon-sm' }),
                        'text-muted-foreground hover:bg-muted',
                      )
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
      <Table className="dark:bg-card table-fixed min-w-(--table-min-width)" style="width: 100%">
        <TableHeader class="dark:bg-primary-foreground/50 bg-neutral-100">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <template v-for="(header, index) in headerGroup.headers" :key="header.id">
              <DraggableColumnHeader
                v-if="options?.columnOrder && !header.column.columnDef.meta?.disableDragging"
                :header="header"
                :index="draggableColumnIds.indexOf(header.column.id)"
                :is-last-column="index === headerGroup.headers.length - 1"
                :column-sizing="options?.columnSizing"
              />
              <TableHead
                v-else
                class="relative overflow-hidden py-2.5"
                :style="{
                  minWidth: header.column.columnDef.minSize,
                  width:
                    index === headerGroup.headers.length - 1 ? 'auto' : `calc(var(--header-${header.id}-size) * 1px)`,
                  maxWidth: index === headerGroup.headers.length - 1 ? undefined : header.column.columnDef.maxSize,
                }"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <div
                  v-if="index !== headerGroup.headers.length - 1 && options?.columnSizing"
                  @dblclick="header.column.resetSize()"
                  @mousedown="header.getResizeHandler()($event)"
                  @touchstart="header.getResizeHandler()($event)"
                  :class="
                    cn(
                      'hover:bg-primary/50 active:bg-primary absolute top-0 right-0 h-full w-0.75 cursor-col-resize touch-none bg-transparent transition-colors select-none',
                      header.column.getIsResizing() && 'bg-primary',
                    )
                  "
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
              v-for="(cell, index) in row.getVisibleCells()"
              :key="cell.id"
              class="overflow-hidden border-r whitespace-normal last:border-none"
              :style="{
                minWidth: cell.column.columnDef.minSize,
                width:
                  index === row.getVisibleCells().length - 1 ? 'auto' : `calc(var(--col-${cell.column.id}-size) * 1px)`,
              }"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
          <TableRow v-if="table.getRowModel().rows.length === 0">
            <TableCell :colSpan="columns?.length ?? 1" class="h-24 text-center"> Sin resultados </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <DragOverlay :dropAnimation="null">
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
