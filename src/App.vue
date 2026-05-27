<script setup lang="ts">
import { GithubIcon } from "@/components/icons";
import { VueIcon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components";
import { SortableIcon } from "@/components";
import { ToggleTheme } from "@/components";

import type { ColumnDef } from "@tanstack/vue-table";
import { h, ref, watch } from "vue";

import type { ITableOptions } from "@/components/DataTable.vue";
import { DataService, type ICharacter } from "@/services/data.service";

const INIT_OPTS: ITableOptions = {
  columnOrder: true,
  columnSearch: true,
  columnSizing: true,
  exportPdf: true,
  exportXls: true,
  globalSearch: true,
  hideColumns: true,
  showTooltips: true,
  simulateAsync: false,
};

const OPTION_GROUPS: { name: string; options: { key: keyof ITableOptions; label: string }[] }[] = [
  {
    name: "exports",
    options: [
      { key: "exportPdf", label: "Export PDF" },
      { key: "exportXls", label: "Export XLS" },
    ],
  },
  {
    name: "columns",
    options: [
      { key: "columnOrder", label: "Sort columns" },
      { key: "hideColumns", label: "Hide columns" },
      { key: "columnSizing", label: "Resize columns" },
    ],
  },
  {
    name: "search",
    options: [
      { key: "columnSearch", label: "Search in columns" },
      { key: "globalSearch", label: "Global search" },
    ],
  },
  {
    name: "async",
    options: [
      { key: "simulateAsync", label: "Simulate slow connection" },
      { key: "showTooltips", label: "Show tooltips" },
    ],
  },
];

const data = ref<ICharacter[]>([]);
const delay = ref<number>(0);
const loading = ref<boolean>(false);
const tableOptions = ref<ITableOptions>(INIT_OPTS);

watch(delay, (val) => getData(val), { immediate: true });

const columns: ColumnDef<ICharacter>[] = [
  {
    accessorKey: "select-col",
    id: "Select",
    size: 20,
    enableColumnFilter: false,
    meta: {
      alignment: "center",
      disableExport: true,
      disableDragging: true,
    },
    header: ({ table }) =>
      h(Checkbox, {
        class: "bg-background border-foreground/30 -ml-2",
        modelValue: table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false,
        "onUpdate:modelValue": (checked) => table.toggleAllRowsSelected(checked === true),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        class: "-ml-2",
        modelValue: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        "onUpdate:modelValue": (checked) => row.toggleSelected(checked === true),
      }),
  },
  {
    accessorKey: "id",
    id: "ID",
    size: 20,
    enableColumnFilter: false,
    meta: { disableDragging: true },
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
  {
    accessorKey: "name",
    id: "Name",
    size: 80,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
  {
    accessorKey: "gender",
    id: "Gender",
    size: 40,
    enableColumnFilter: false,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
  {
    accessorKey: "age",
    id: "Age",
    size: 40,
    enableColumnFilter: false,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
    cell: ({ row }) => h("span", row.original.age ?? "-"),
  },
  {
    accessorKey: "occupation",
    id: "Occupation",
    minSize: 200,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
];

async function getData(delay: number): Promise<any> {
  try {
    if (delay > 0) loading.value = true;
    const query = await DataService.get(delay);
    data.value = query;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function setOption<K extends keyof ITableOptions>(key: K, value: ITableOptions[K]): void {
  if (key === "simulateAsync") {
    delay.value = value ? 4000 : 0;
  }
  tableOptions.value = {
    ...tableOptions.value,
    [key]: value,
  };
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <header class="border-border border-b">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div class="flex flex-col">
          <h1 class="text-lg font-semibold tracking-tight">Tanstack Table</h1>
          <div class="flex items-center gap-1">
            <VueIcon class="fill-foreground" />
            <span class="text-muted-foreground text-sm tracking-tight">Vue</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/alanloffler/tanstack-table-vue-template"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="icon-sm" variant="outline">
              <GithubIcon class="stroke-neutral-500" :strokeWidth="1.5" />
            </Button>
          </a>
          <ToggleTheme />
        </div>
      </div>
    </header>
    <main class="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
      <Card class="flex flex-col gap-3">
        <CardHeader>
          <CardTitle>Table options</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex gap-10 text-sm">
            <ul v-for="group in OPTION_GROUPS" :key="group.name" class="flex flex-col gap-3">
              <li v-for="opt in group.options" :key="opt.key" class="flex items-center gap-2">
                <Checkbox
                  :id="opt.key"
                  :model-value="tableOptions[opt.key] ?? false"
                  @update:model-value="(v) => setOption(opt.key, v === true)"
                />
                <label :for="opt.key">{{ opt.label }}</label>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
      <Card class="flex flex-col gap-3">
        <CardHeader>
          <CardTitle>Simpsons characters</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            :columns="columns"
            :data="data"
            :loading="loading"
            :options="tableOptions"
            storageKey="characters-01"
          />
        </CardContent>
      </Card>
      <section class="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">Simpsons characters</h2>
        <DataTable
          :columns="columns"
          :data="data"
          :loading="loading"
          :options="tableOptions"
          storageKey="characters-02"
        />
      </section>
    </main>
  </div>
</template>
