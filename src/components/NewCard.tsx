import { useParams } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { upsertItem } from "~/lib/queries";

type NewCardProps = {
    columnId: string;
}

export default function NewCard(props: NewCardProps) {
    const params = useParams();
    const [editing, setEditing] = createSignal(false);
    let buttonRef: HTMLButtonElement | undefined;

    return (
        <Show when={editing()} fallback={<div class="p-2">
            <button onClick={() => setEditing(true)} type="button" class="flex items-center gap-2 rounded-lg text-left w-full p-2 font-medium text-slate-500 hover:bg-slate-200 focus:bg-slate-200">
                Add a card
            </button>
        </div>}>
            <form action={upsertItem} method="post" class="px-2 py-1 border-t-2 border-b-2 border-transparent">
                <input name="id" type="hidden" value={crypto.randomUUID()} />
                <input name="boardId" type="hidden" value={params.id} />
                <input name="columnId" type="hidden" value={props.columnId} />
                <textarea
                    name="title"
                    autofocus
                    required
                    placeholder="Enter a title for this card"
                    class="outline-none shadow text-sm rounded-lg w-full py-1 px-2 resize-none placeholder:text-sm placeholder:text-slate-500 h-14"
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            buttonRef?.click();
                        }
                    }}
                />
                < div class="flex justify-between">
                    <button ref={buttonRef} type="submit" class="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue">
                        Save Card
                    </button>
                    <button class="text-sm rounded-lg text-left p-2 font-medium hover:bg-slate-200 focus:bg-slate-200"
                        onClick={() => setEditing(false)}>
                        Cancel
                    </button>
                </div>
            </form>
        </Show >
    )
}