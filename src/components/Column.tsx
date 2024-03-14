import EditableText from "./EditableText";
import { updateColumnName } from "~/lib/queries";
import { useAction } from "@solidjs/router";
import Card from "./Card";
import { Accessor } from "solid-js";

type ColumnProps = {
    column: { name: string; id: string };
    user: Accessor<{
        id: string;
        email: string;
    } | undefined>
}

export default function Column(props: ColumnProps) {
    const updateColumNNameAction = useAction(updateColumnName);

    return (
        <div class="flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border-slate-400 rounded-xl shadow-sm shadow-slate-400 bg-slate-100 ">
            <div class="p-2">
                <EditableText
                    text={props.column.name || ''}
                    saveAction={(value: string) => updateColumNNameAction(props.column.id, value, props.user()?.id!)}
                />
            </div>
            <ul class="flex-grow overflow-auto">
                <Card />
            </ul>
            <div class="p-2">
                <button type="button" class="flex items-center gap-2 rounded-lg text-left w-full p-2 font-medium text-slate-500 hover:bg-slate-200 focus:bg-slate-200">Add a card</button>
            </div>
        </div>
    )
}