import { RouteDefinition, createAsyncStore, useAction, useSubmission, useSubmissions } from "@solidjs/router";
import { For, createEffect, createSignal } from "solid-js";
import EditableText from "~/components/EditableText";
import { NewColumn } from "~/components/NewColumn";
import { createColumn, getBoardData, updateBoardName } from "~/lib/queries";
import Column from "~/components/Column"

export const route = {
    load: ({ params }) => getBoardData(+params.id)
} satisfies RouteDefinition;

export default function Board({ params }: any) {
    const board = createAsyncStore(() => getBoardData(+params.id));

    const updateBoardNameAction = useAction(updateBoardName);
    const submission = useSubmission(updateBoardName);
    const columnSubmission = useSubmissions(createColumn);
    let [pendingColumns, setPendingColumns] = createSignal<any[]>([]);

    createEffect(() => {
        let mutations = [];
        for (const pendingItem of columnSubmission.values()) {
            if (!pendingItem.pending) continue;
            mutations.push({
                id: pendingItem.input[2],
                name: pendingItem.input[1],
            })
        }
        setPendingColumns(mutations);
    })

    return (
        <div class="h-full min-h-0 flex flex-col overflow-x-scroll" style="background-color:#cbd5e1">
            <a href="/">Back</a>
            <h1 class="mx-8 my-4">
                <EditableText
                    text={submission.input && submission.input[1] || board()?.name || ''}
                    saveAction={(value: string) => updateBoardNameAction(+params.id, value)}
                />
            </h1>

            <div class="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
                <For each={board()?.columns}>
                    {(column) => {
                        const items = () => board()?.items.filter(item => item.columnId === column.id);
                        return <Column column={column} items={items} />
                    }}
                </For>
                <For each={pendingColumns()}>
                    {(column) => {
                        return <Column column={column} items={() => []} />
                    }}
                </For>

                <NewColumn
                    boardId={board()?.id!}
                    editInitially={!board() || board()!.columns.length === 0}
                />
            </div>
        </div >
    )
}