<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <header class="border-border border-b">
      <div
        class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <h1 class="text-lg font-semibold tracking-tight">Tanstack Table</h1>
      </div>
    </header>
    <main class="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
      <Card class="flex flex-col gap-3">
        <CardHeader>
          <CardTitle>Opciones de la tabla</CardTitle>
        </CardHeader>
        <CardContent> Content </CardContent>
      </Card>
    </main>
  </div>
</template>
