import type { Category  } from "$lib/model";
import type { ColumnDef } from "@tanstack/table-core";
import {
  renderSnippet,
  renderComponent,
} from "$lib/components/ui/data-table/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { getFormattedDate } from "$lib/api";
import DataTableActions from "./table-action.svelte";


export const columns: ColumnDef<Category>[] = [
  {
    id: "select",
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        controlledChecked: true,
        "aria-label": "全选"
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        controlledChecked: true,
        "aria-label": "选择行"
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",  
    header: "ID",
  },
  {
    accessorKey: "slug",
    header: "缩写",
  },
  {
    accessorKey: "text",
    header: "标题",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row, table }) =>
      renderComponent(DataTableActions, {
        category: row.original,
        id: row.original.id.toString(),
        pageIndex: table.getState().pagination.pageIndex + 1, // 转换为从1开始的索引
        onUpdate: table.options.meta?.onUpdate,
        onDelete: table.options.meta?.onDelete
      }),
  }
];
