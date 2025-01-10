<script lang="ts">
    import { readable, writable, type Writable } from "svelte/store";
    import { Post, PaginationType } from "$lib/model";
    import {
        getFormattedDate,
        getFormattedDateWithoutTime,
        getPosts,
    } from "$lib/api";
    import TableAction from "./table-action.svelte";
    import DataTableCheckbox from "./data-table-checkbox.svelte";
    import { Button } from "$lib/components/ui/button";
    import { PAGE_SIZE } from "$lib/params/base";
    import { posts } from "$lib/stores/posts";
    import {
        createSvelteTable,
        FlexRender,
    } from "$lib/components/ui/data-table/index.js";
    import {
        type ColumnDef,
        type PaginationState,
        getCoreRowModel,
        getPaginationRowModel,
        type SortingState,
        type ColumnFiltersState,
        type VisibilityState,
        type RowSelectionState,
        getSortedRowModel,
        getFilteredRowModel,
    } from "@tanstack/table-core";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { createEventDispatcher } from "svelte";

    type DataTableProps<TData, TValue> = {
        data: TData[];
        columns: ColumnDef<TData, TValue>[];
        pagination: PaginationType;
    };

    const dispatch = createEventDispatcher();

    let { data, columns, pagination: paginationFromServer }: DataTableProps<Post, unknown> = $props();

    let pagination = $state<PaginationState>({
        pageIndex: paginationFromServer?.pageIndex ?? 0, 
        pageSize: PAGE_SIZE
    });

    let rowSelection = $state<RowSelectionState>({});

    // 处理删除成功事件
    function handleDeleteSuccess() {
        dispatch('deleteSuccess');
    }

    const table = createSvelteTable({
        get data() {
            return data;
        },
        get columns() {
            return columns;
        },
        state: {
            get pagination() {
                return pagination;
            },
            get rowSelection() {
                return rowSelection;
            },
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: (updater) => {
            if (typeof updater === "function") {
                rowSelection = updater(rowSelection);
            } else {
                rowSelection = updater;
            }
            dispatch('selectionChange', table.getSelectedRowModel().rows);
        },
        manualPagination: true,
        pageCount: paginationFromServer?.totalPages ?? 1,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                pagination = updater(pagination);
            } else {
                pagination = updater;
            }
            // Trigger server-side data fetch when pagination changes
            dispatch('paginationChange', pagination);
        },
        
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

</script>

<div>
    <div class="w-full overflow-x-auto">
        <div class="rounded-md border">
            <Table.Root>
                <Table.Header>
                    {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                        <Table.Row>
                            {#each headerGroup.headers as header (header.id)}
                                <Table.Head>
                                    {#if !header.isPlaceholder}
                                        <FlexRender
                                            content={header.column.columnDef.header}
                                            context={header.getContext()}
                                        />
                                    {/if}
                                </Table.Head>
                            {/each}
                        </Table.Row>
                    {/each}
                </Table.Header>
                <Table.Body>
                    {#each table.getRowModel().rows as row (row.id)}
                        <Table.Row
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {#each row.getVisibleCells() as cell (cell.id)}
                                <Table.Cell>
                                    {#if cell.column.columnDef.id === 'actions'}
                                        <FlexRender
                                            content={cell.column.columnDef.cell}
                                            context={cell.getContext()}
                                            on:deleteSuccess={handleDeleteSuccess}
                                        />
                                    {:else}
                                        <FlexRender
                                            content={cell.column.columnDef.cell}
                                            context={cell.getContext()}
                                        />
                                    {/if}
                                </Table.Cell>
                            {/each}
                        </Table.Row>
                    {:else}
                        <Table.Row>
                            <Table.Cell
                                colspan={columns.length}
                                class="h-24 text-center"
                            >
                                No results.
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    </div>
    <!-- Pagination BEGIN -->
    <div class="flex items-center justify-end space-x-2 py-4">
        <Button
            variant="outline"
            size="sm"
            onclick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
        >
            上一页
        </Button>
        <Button
            variant="outline"
            size="sm"
            onclick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
        >
            下一页
        </Button>
    </div>
    <!-- Pagination END -->
</div>
