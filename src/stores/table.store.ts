import type { ColumnSizingState } from "@tanstack/vue-table";
import { defineStore } from "pinia";

interface ITableState {
  columnOrder: string[];
  columnSizing: ColumnSizingState;
  columnVisibility: Record<string, boolean>;
}

interface IState {
  tables: Record<string, ITableState>;
}

export const useTableStore = defineStore("table-store", {
  state: (): IState => ({
    tables: {},
  }),
  actions: {
    clearTable(storageKey: string) {
      delete this.tables[storageKey];
    },
    setColumnOrder(tableId: string, order: string[]) {
      this.tables[tableId] = {
        ...this.tables[tableId],
        columnOrder: order,
      };
    },
    setColumnSizing(tableId: string, sizing: ColumnSizingState) {
      this.tables[tableId] = {
        ...this.tables[tableId],
        columnSizing: sizing,
      };
    },
    setColumnVisibility(tableId: string, visibility: Record<string, boolean>) {
      this.tables[tableId] = {
        ...this.tables[tableId],
        columnVisibility: visibility,
      };
    },
  },
  persist: true,
});
