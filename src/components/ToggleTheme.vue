<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue";

import { Button } from "@/components/ui/button";

import { useColorMode } from "@vueuse/core";

const mode = useColorMode();

function toggleTheme(e: MouseEvent): void {
  document.documentElement.style.setProperty("--x", `${e.clientX}px`);
  document.documentElement.style.setProperty("--y", `${e.clientY}px`);
  document.startViewTransition(() => (mode.value === "dark" ? (mode.value = "light") : (mode.value = "dark")));
}
</script>

<template>
  <Button @click="(e: MouseEvent) => toggleTheme(e)" size="icon-sm" variant="outline">
    <Sun v-if="mode === 'dark'" class="stroke-yellow-400" stroke-width="1.5" />
    <Moon v-else class="fill-neutral-200 stroke-neutral-400" stroke-width="1.5" />
  </Button>
</template>
