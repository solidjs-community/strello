import EditableText from "./EditableText";
import { updateColumnName, upsertItem } from "~/lib/queries";
import { useAction, useSubmission, useSubmissions } from "@solidjs/router";
import Card from "./Card";
import { For, createEffect, createSignal } from "solid-js";
import { Item } from "@prisma/client";
import NewCard from "./NewCard";

type ColumnProps = {
    column: { name: string; id: string };
    items: () => Item[] | undefined
}


export default function Column(props: ColumnProps) {
    const updateColumNNameAction = useAction(updateColumnName);
    const submission = useSubmission(updateColumnName);
    const itemSubmissions = useSubmissions(upsertItem);
    let [pendingItems, setPendingItems] = createSignal<any[]>([]);

    createEffect(() => {
        let mutations = [];
        for (const pendingItem of itemSubmissions.values()) {
            const columnId = pendingItem.input[0].get('columnId');
            if (!pendingItem.pending || columnId !== props.column.id) continue;
            mutations.push({
                id: String(pendingItem.input[0].get('id')),
                title: String(pendingItem.input[0].get('title')),
            })
        }
        setPendingItems(mutations);
    })

    return (
        <div class="flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border-slate-400 rounded-xl shadow-sm shadow-slate-400 bg-slate-100 ">
            <div class="p-2">
                <EditableText
                    text={submission.input && submission.input[1] || props.column.name || ''}
                    saveAction={(value: string) => updateColumNNameAction(props.column.id, value)}
                />
            </div>
            <ul class="flex-grow overflow-auto">
                <For each={props.items()}>
                    {(item) => (<Card item={item} />)}
                </For>
                <For each={pendingItems()}>
                    {(pendingItem) => (<Card item={pendingItem} />)}
                </For>
            </ul>

            <NewCard columnId={props.column.id} />

        </div>
    )
}