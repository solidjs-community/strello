import EditableText from "./EditableText";
import { updateColumnName } from "~/lib/queries";
import { useAction } from "@solidjs/router";
import Card from "./Card";
import { For, createEffect } from "solid-js";
import { Item } from "@prisma/client";
import NewCard from "./NewCard";

type ColumnProps = {
    column: { name: string; id: string };
    items: () => Item[] | undefined
}

export default function Column(props: ColumnProps) {
    const updateColumNNameAction = useAction(updateColumnName);

    return (
        <div class="flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border-slate-400 rounded-xl shadow-sm shadow-slate-400 bg-slate-100 ">
            <div class="p-2">
                <EditableText
                    text={props.column.name || ''}
                    saveAction={(value: string) => updateColumNNameAction(props.column.id, value)}
                />
            </div>
            <ul class="flex-grow overflow-auto">
                <For each={props.items()}>
                    {(item) => (<Card item={item} />)}
                </For>
            </ul>

            <NewCard columnId={props.column.id} />

        </div>
    )
}