import type { Post } from "$lib/model";
import type { ColumnDef } from "@tanstack/table-core";
import {
  renderSnippet,
  renderComponent,
} from "$lib/components/ui/data-table/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import DataTableActions from "./table-action.svelte";
import { getFormattedDate } from "$lib/api";

export const columns: ColumnDef<Post>[] = [
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
    accessorKey: "title",
    header: "标题",
  },
  {
    accessorKey: "category",
    header: "分类",
    cell: ({ row }) => row.original.category?.text || "未分类",
  },
  {
    accessorKey: "createdAt",
    header: "创建日期",
    cell: ({ row }) => getFormattedDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row, table }) =>
      renderComponent(DataTableActions, {
        id: row.original.id.toString(),
        pageIndex: table.getState().pagination.pageIndex + 1 // 转换为从1开始的索引
      }),
  }
];
