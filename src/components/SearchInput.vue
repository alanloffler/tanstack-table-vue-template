<script setup lang="ts">
import { Search, X } from "@lucide/vue";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const searchInputVariants = cva("relative w-fit", {
  variants: {
    size: {
      sm: "[&_svg:first-child]:size-3 [&_svg:first-child]:left-4 [&_input]:h-7 [&_input]:pl-7 [&_input]:text-xs",
      default: "",
      lg: "[&_svg:first-child]:size-5 [&_svg:first-child]:left-6 [&_input]:h-10 [&_input]:pl-10 [&_input]:text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface IProps {
  class?: string;
  onChange: (value: string | number) => void;
  onClear: () => void;
  size?: VariantProps<typeof searchInputVariants>["size"];
  value: string;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "default",
});
</script>

<template>
  <div :class="cn(searchInputVariants({ size }), props.class)">
    <Search class="stroke-primary absolute top-1/2 left-5 h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
    <Input :model-value="value" @update:model-value="onChange" class="pl-9" placeholder="Search..." />
    <Button
      v-if="value"
      class="absolute top-1/2 -right-1.5 size-6 -translate-x-1/2 -translate-y-1/2 active:not-aria-[haspopup]:-translate-y-1/2"
      @click="onClear"
      size="icon-sm"
      variant="ghost"
    >
      <X class="size-3" />
    </Button>
  </div>
</template>
