# TanStack Vue Table

Template with a full-featured DataTable component built on TanStack Table v8.

## Technology

- [Vite](https://vite.dev/)
- [Vue 3](https://vuejs.org/)
- [TanStack Table v8](https://tanstack.com/table/latest)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn-vue](https://www.shadcn-vue.com/)
- [Pinia](https://pinia.vuejs.org/)
- [dnd-kit](https://dndkit.com/)

---

## DataTable

A generic, fully-typed table component that supports sorting, pagination, filtering, column resizing, drag-and-drop reordering, column visibility, and export.

### Basic usage

```ts
<script setup lang="ts">
import { h, ref } from "vue";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/vue-table";

interface IUser {
  id: number;
  name: string;
  email: string;
}

const data = ref<IUser[]>([]);

const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: "id",
    id: "ID",
    size: 40,
    header: ({ column }) => h("span", column.id),
  },
  {
    accessorKey: "name",
    id: "Nombre",
    size: 120,
    header: ({ column }) => h("span", column.id),
  },
  {
    accessorKey: "email",
    id: "Email",
    header: ({ column }) => h("span", column.id),
  },
];
</script>

<template>
  <DataTable :data="data" :columns="columns" storage-key="users-table" />
</template>
```

---

## Props

### Required

| Prop | Type | Description |
|------|------|-------------|
| `data` | `TData[]` | Row data. Pass an empty array and set `:loading="true"` to show skeletons. |
| `columns` | `ColumnDef<TData, TValue>[]` | TanStack column definitions. |
| `storage-key` | `string` | Unique key used to persist column state (order, visibility, sizing) in Pinia + localStorage. Each table instance must have a different key. |

### Optional

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Shows skeleton rows while data is loading. |
| `default-page-size` | `number` | `5` | Initial number of rows per page. |
| `default-sorting` | `SortingState` | `[]` | Initial sort state. Example: `[{ id: "Nombre", desc: false }]`. |
| `page-sizes` | `number[]` | `[5, 10, 20, 50]` | Available options in the page size selector. |
| `options` | `ITableOptions` | `{}` | Feature flags — see below. |
| `export-pdf-config` | `object` | — | PDF export configuration — see below. |
| `export-xls-config` | `object` | — | XLS export configuration — see below. |

---

## options

All flags are `boolean` and default to `false` (disabled). Import from `@/components/DataTable.vue`:

```ts
import type { ITableOptions } from "@/components/DataTable.vue";
```

| Flag | Description |
|------|-------------|
| `columnSearch` | Shows a per-column filter input row below the header. |
| `columnSizing` | Enables drag-to-resize on column borders. Double-click a border to reset that column to its default size. |
| `columnOrder` | Enables drag-and-drop column reordering via `@dnd-kit/vue`. Also shows the reset button. |
| `exportPdf` | Shows the PDF export button. Requires `exportPdfConfig`. |
| `exportXls` | Shows the XLS export button. Requires `exportXlsConfig`. |
| `globalSearch` | Shows the global search input that filters across all columns. |
| `hideColumns` | Shows the column visibility popover to toggle individual columns. Also shows the reset button. |
| `showTooltips` | Shows tooltips on action buttons. |
| `simulateAsync` | Not consumed by DataTable — used by parent to drive the `loading` prop. |

```ts
const options: ITableOptions = {
  columnOrder: true,
  columnSearch: true,
  columnSizing: true,
  exportPdf: true,
  exportXls: true,
  globalSearch: true,
  hideColumns: true,
  showTooltips: true,
};
```

```ts
<DataTable :options="options" storage-key="users-table" />
```

---

## exportPdfConfig

| Field | Type | Description |
|-------|------|-------------|
| `filename` | `string` | Output filename without extension. Defaults to `"export"`. |
| `title` | `string` | Title printed at the top of the PDF document. |
| `formatters` | `Record<string, TPdfFormatter<TData>>` | Per-column value formatters. Key is the column `id`. |

`TPdfFormatter<T>` signature: `(row: T) => string`

```ts
const exportPdfConfig = {
  filename: "usuarios",
  title: "Listado de usuarios",
  formatters: {
    Edad: (row: IUser) => `${row.age} años`,
  },
};
```

---

## exportXlsConfig

| Field | Type | Description |
|-------|------|-------------|
| `filename` | `string` | Output filename without extension. Defaults to `"export"`. |
| `sheetName` | `string` | Name of the Excel sheet. Defaults to `"Sheet1"`. |
| `formatters` | `Record<string, TXlsFormatter<TData>>` | Per-column value formatters. Key is the column `id`. |

`TXlsFormatter<T>` signature: `(row: T) => string`

```ts
const exportXlsConfig = {
  filename: "usuarios",
  sheetName: "Usuarios",
  formatters: {
    Activo: (row: IUser) => (row.active ? "Sí" : "No"),
  },
};
```

---

## Column definition extras

Beyond standard TanStack `ColumnDef` fields, the component reads these:

| Field | Type | Description |
|-------|------|-------------|
| `size` | `number` | Initial column width weight. Columns are distributed proportionally across the container based on this value. |
| `minSize` | `number` | Minimum width in pixels the column can be resized to. Falls back to the global default of `40px`. |
| `enableColumnFilter` | `boolean` | Set to `false` to hide the filter input for this column when `columnSearch` is enabled. |
| `meta.alignment` | `"left" `&#124;` "center" `&#124;` "right"` | Text alignment for the column. |
| `meta.disableDragging` | `boolean` | Set to `true` to exclude this column from drag-and-drop reordering (e.g. checkbox or ID columns). |
| `meta.disableExport` | `boolean` | Set to `true` to exclude this column from PDF and XLS exports. |

```ts
{
  accessorKey: "id",
  id: "ID",
  size: 40,
  minSize: 30,
  enableColumnFilter: false,
  meta: {
    alignment: "center",
    disableDragging: true,
    disableExport: true,
  },
  header: ({ column }) => h("span", column.id),
}
```

> The `meta` type is augmented globally via `@tanstack/vue-table` module declaration — no extra import needed. See `src/table.d.ts`.

---

## State persistence

Column order, visibility, and sizing are persisted automatically in `localStorage` via **Pinia** + `pinia-plugin-persistedstate` under the store key `"table-store"`. Each table instance is scoped by its `storage-key` prop.

The reset button (shown when `columnOrder` or `hideColumns` is enabled) calls `clearTable(storageKey)` on the store, removing that table's persisted state and restoring default proportional column widths.

**Store structure:**

```ts
interface ITableState {
  columnOrder: string[];
  columnSizing: ColumnSizingState;
  columnVisibility: Record<string, boolean>;
}

interface ITableStore {
  tables: Record<string, ITableState>;  // keyed by storageKey
}
```
