import { createAsync, useAction } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { NewColumn } from "~/components/NewColumn";
import { getUser } from "~/lib";
import { getBoardData, updateBoardName } from "~/lib/queries";


export const route = {
}

export default function Board({ params }: any) {
    const user = createAsync(() => getUser());
    const board = createAsync(() => getBoardData(+params.id, user()?.id!));
    const [editBoardName, setEditBoardName] = createSignal(false);
    const updateBoardNameAction = useAction(updateBoardName);

    return (
        <div class="h-full min-h-0 flex flex-col overflow-x-scroll" style="background-color:#cbd5e1">
            <h1>
                <Show when={editBoardName()} fallback={
                    <button
                        onClick={() => setEditBoardName(true)}
                        aria-label="Edit board name"
                        type="button"
                        class="mx-8 my-4 text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800">
                        {board()?.name}
                    </button>
                }>
                    <input
                        class="mx-8 my-4 text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
                        type="text"
                        value={board()?.name}
                        // action.apply is not a function?
                        onBlur={(e) => updateBoardNameAction(params.id, e.target.value, user()?.id!)}
                    />
                </Show>
            </h1>

            <div class="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
                <For each={board()?.columns}>
                    {(column) => (
                        <div class="flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border-slate-400 rounded-xl shadow-sm shadow-slate-400 bg-slate-100 ">
                            <div class="p-2">
                                <button aria-label="Edit column name" type="button" class="block rounded-lg text-left w-full border border-transparent py-1 px-2 font-medium text-slate-600">
                                    {column.name}
                                </button>
                            </div>
                            <ul class="flex-grow overflow-auto">
                                {/* <li class="border-t-2 border-b-2 -mb-[2px] last:mb-0 cursor-grab active:cursor-grabbing px-2 py-1 border-t-transparent border-b-transparent">
                                    <div draggable="true" class="bg-white shadow shadow-slate-300 border-slate-300 text-sm rounded-lg w-full py-1 px-2 relative"><h3>dfs</h3>
                                        <div class="mt-2">&nbsp;</div>
                                        <form method="post" action="/board/1730">
                                            <input type="hidden" name="intent" value="deleteCard" />
                                            <input type="hidden" name="itemId" value="810aebf5-d019-41ef-965e-05188e8eb35c" />
                                            <button aria-label="Delete card" class="absolute top-4 right-4 hover:text-brand-red" type="submit">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </li> */}
                            </ul>
                            <div class="p-2">
                                <button type="button" class="flex items-center gap-2 rounded-lg text-left w-full p-2 font-medium text-slate-500 hover:bg-slate-200 focus:bg-slate-200">Add a card</button>
                            </div>
                        </div>
                    )}
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