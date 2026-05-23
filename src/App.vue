<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components";
import { SortableIcon } from "@/components";

import type { ColumnDef } from "@tanstack/vue-table";
import { h, onMounted, ref } from "vue";

import { DataService, type ICharacter } from "@/services/data.service";

const data = ref<ICharacter[]>([]);
const delay = ref<number>(0);
const loading = ref<boolean>(false);

onMounted(async () => {
  try {
    if (delay.value > 0) loading.value = true;
    const query = await DataService.get(delay.value);
    data.value = query;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const columns: ColumnDef<ICharacter>[] = [
  {
    accessorKey: "id",
    id: "ID",
    size: 20,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
  {
    accessorKey: "name",
    id: "Nombre",
    size: 80,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
  {
    accessorKey: "gender",
    id: "Género",
    size: 40,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
  {
    accessorKey: "age",
    id: "Edad",
    size: 40,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
    cell: ({ row }) => h("span", row.original.age ?? "-"),
  },
  {
    accessorKey: "occupation",
    id: "Ocupación",
    minSize: 200,
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-1" }, [h("span", column.id), h(SortableIcon, { column })]),
  },
];
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <header class="border-border border-b">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <h1 class="text-lg font-semibold tracking-tight">Tanstack Table</h1>
      </div>
    </header>
    <main class="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
      <Card class="flex flex-col gap-3">
        <CardHeader>
          <CardTitle>Personajes de los Simpsons</CardTitle>
        </CardHeader>
        <CardContent><DataTable :columns="columns" :data="data" :loading="loading" /></CardContent>
      </Card>
    </main>
  </div>
</template>
