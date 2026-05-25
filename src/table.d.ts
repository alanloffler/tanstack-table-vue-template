import "@tanstack/vue-table";

declare module "@tanstack/vue-table" {
  interface ColumnMeta {
    alignment?: "left" | "center" | "right";
    disableDragging?: boolean;
    disableExport?: boolean;
  }
}
