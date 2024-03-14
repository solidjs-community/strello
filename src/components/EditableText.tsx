import { Show, createSignal } from "solid-js";

export default function EditableText(props: { text: string; saveAction: (value: string) => void }) {
    const [showEdit, setShowEdit] = createSignal(false);
    return (
        <Show when={showEdit()} fallback={
            <button
                onClick={() => setShowEdit(true)}
                aria-label={`Edit ${props.text}`}
                type="button"
                class="w-full text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800">
                {props.text}
            </button>
        }>
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                props.saveAction(String(formData.get('editable_text')));
                setShowEdit(false);
            }}>
                <input
                    class="text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
                    type="text"
                    name="editable_text"
                    value={props.text}
                    onBlur={(e) => {
                        props.saveAction(e.target.value);
                        setShowEdit(false);
                    }}

                />
            </form>
        </Show >
    )
}