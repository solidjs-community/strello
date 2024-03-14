import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { For } from "solid-js";
import EditableText from "~/components/EditableText";
import { NewColumn } from "~/components/NewColumn";
import { getUser } from "~/lib";
import { getBoardData, updateBoardName } from "~/lib/queries";
import Column from "~/components/Column"

export const route = {
}

export default function Board({ params }: any) {
    const user = createAsync(() => getUser());
    const board = createAsync(() => getBoardData(+params.id, user()?.id!));

    const updateBoardNameAction = useAction(updateBoardName);
    const updateBoardNameSubmission = useSubmission(updateBoardName); // use optimistic update name?

    return (
        <div class="h-full min-h-0 flex flex-col overflow-x-scroll" style="background-color:#cbd5e1">
            <h1 class="mx-8 my-4">
                <EditableText
                    text={board()?.name || ''}
                    saveAction={(value: string) => updateBoardNameAction(+params.id, value, user()?.id!)}
                />
            </h1>

            <div class="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
                <For each={board()?.columns}>
                    {(column) => {
                        const items = board()?.items.filter(item => item.columnId === column.id)
                        return <Column column={column} user={user} items={items} />
                    }}
                </For>
                <NewColumn
                    boardId={board()?.id!}
                    editInitially={board()?.columns.length === 0}
                    accountId={user()?.id!}
                />
            </div>
        </div >
    )
}