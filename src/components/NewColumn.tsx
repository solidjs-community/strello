import { action, useAction } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { db } from "~/lib/db";

export const createColumn = action(async (
    boardId: number,
    name: string,
    id: string,
    accountId: string,
) => {
    "use server";
    let columnCount = await db.column.count({
        where: { boardId, Board: { accountId } },
    });
    return db.column.create({
        data: {
            id,
            boardId,
            name,
            order: columnCount + 1,
        },
    });
}, 'create-column');

export function NewColumn(props: {
    boardId: number;
    editInitially: boolean;
    accountId: string
}) {
    let [editing, setEditing] = createSignal(props.editInitially);
    let submit = useAction(createColumn);

    return (
        <Show when={editing()} fallback={<button
            onClick={() => {
                setEditing(true);
            }}
            aria-label="Add new column"
            class="flex-shrink-0 flex justify-center h-16 w-16 bg-black hover:bg-white bg-opacity-10 hover:bg-opacity-5 rounded-xl"
        >
            +
        </button>}>
            <form
                method="post"
                class="p-2 flex-shrink-0 flex flex-col gap-5 overflow-hidden max-h-full w-80 border rounded-xl shadow bg-slate-100"
                onSubmit={(event) => {
                    event.preventDefault();
                    let formData = new FormData(event.currentTarget);
                    submit(
                        props.boardId,
                        String(formData.get('name')),
                        crypto.randomUUID(),
                        props.accountId
                    );
                }}
                onBlur={() => {
                    setEditing(false);
                }}
            >
                <input
                    autofocus
                    required
                    type="text"
                    name="name"
                    class="border border-slate-400 w-full rounded-lg py-1 px-2 font-medium text-black"
                />
                <div class="flex justify-between">
                    <button type="submit" class="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue"
                    >Save Column
                    </button>
                    <button class="text-sm rounded-lg text-left p-2 font-medium hover:bg-slate-200 focus:bg-slate-200"
                        onClick={() => setEditing(false)}>
                        Cancel
                    </button>
                </div>
            </form>
        </Show>
    )
}