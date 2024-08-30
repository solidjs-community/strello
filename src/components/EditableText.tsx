import { Show, createEffect, createSignal } from "solid-js";

export default function EditableText(props: {
  text: string;
  saveAction: (value: string) => void;
}) {
  const [showEdit, setShowEdit] = createSignal(false);

  return (
    <Show
      when={showEdit()}
      fallback={
        <button
          onClick={() => setShowEdit(true)}
          aria-label={`Edit ${props.text}`}
          type="button"
          class="w-full text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2"
        >
          {props.text}
        </button>
      }
    >
      {(_) => {
        let inputRef: HTMLInputElement | undefined;

        createEffect(() => inputRef?.focus());

        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              props.saveAction(String(formData.get("editable_text")));
              setShowEdit(false);
            }}
          >
            <input
              class="dark:text-white text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2"
              type="text"
              required
              name="editable_text"
              value={props.text}
              ref={inputRef}
              onBlur={(e) => {
                if (e.target.checkValidity()) {
                  props.saveAction(e.target.value);
                  setShowEdit(false);
                }
              }}
            />
          </form>
        );
      }}
    </Show>
  );
}
