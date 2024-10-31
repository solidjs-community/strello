import { action, json, useAction } from "@solidjs/router";
import { BsPlus, BsTrash } from "solid-icons/bs";
import { RiEditorDraggable } from "solid-icons/ri";
import { Match, Switch, createSignal } from "solid-js";
import { BoardId, DragTypes } from "./Board";
import { ColumnId } from "./Column";
import { getIndexBetween } from "~/lib/utils";
import { getAuthUser } from "~/lib/auth";
import { db } from "~/lib/db";
import { fetchBoard } from "~/lib";

export const createNote = action(
  async ({
    id,
    column,
    body,
    order,
    timestamp,
    board,
  }: {
    id: NoteId;
    board: BoardId;
    column: ColumnId;
    body: string;
    order: number;
    timestamp: number;
  }) => {
    "use server";
    const accountId = await getAuthUser();
    const mutation = {
      id: String(id),
      title: String(body),
      order,
      boardId: +board,
      columnId: String(column),
    };

    await db.item.upsert({
      where: {
        id: mutation.id,
        Board: {
          accountId,
        },
      },
      create: mutation,
      update: mutation,
    });

    return json(true, { revalidate: fetchBoard.key });
  },
  "create-item"
);

export const editNote = action(
  async (id: NoteId, content: string, timestamp: number) => {
    "use server";
    const accountId = await getAuthUser();
    const mutation = {
      id: String(id),
      title: String(content),
    };

    await db.item.update({
      where: {
        id: mutation.id,
        Board: {
          accountId,
        },
      },
      data: mutation,
    });

    return json(true, { revalidate: fetchBoard.key });
  },
  "edit-item"
);

export const moveNote = action(
  async (note: NoteId, column: ColumnId, order: number, timestamp: number) => {
    "use server";
    const accountId = await getAuthUser();
    const mutation = {
      id: String(note),
      columnId: String(column),
      order,
    };

    await db.item.update({
      where: {
        id: mutation.id,
        Board: {
          accountId,
        },
      },
      data: mutation,
    });

    return json(true, { revalidate: fetchBoard.key });
  },
  "move-item"
);

export const deleteNote = action(async (id: NoteId, timestamp: number) => {
  "use server";
  const accountId = await getAuthUser();

  await db.item.delete({ where: { id, Board: { accountId } } });

  return json(true, { revalidate: fetchBoard.key });
}, "delete-card");

export type NoteId = string & { __brand?: "NoteId" };

export type Note = {
  id: NoteId;
  board: BoardId;
  column: ColumnId;
  order: number;
  body: string;
};

export function Note(props: { note: Note; previous?: Note; next?: Note }) {
  const updateAction = useAction(editNote);
  const deleteAction = useAction(deleteNote);
  const moveNoteAction = useAction(moveNote);

  let input: HTMLTextAreaElement | undefined;

  const [isBeingDragged, setIsBeingDragged] = createSignal(false);

  const [acceptDrop, setAcceptDrop] = createSignal<"top" | "bottom" | false>(
    false
  );

  return (
    <div
      style={{
        opacity: isBeingDragged() ? 0.25 : 1,
        "border-top":
          acceptDrop() === "top" ? "2px solid red" : "2px solid transparent",
        "border-bottom":
          acceptDrop() === "bottom" ? "2px solid red" : "2px solid transparent",
      }}
      draggable="true"
      class="card card-side px-1 py-2 w-full bg-slate-200 text-lg flex justify-between items-center space-x-1"
      onDragStart={(e) => {
        e.dataTransfer?.setData(DragTypes.Note, props.note.id.toString());
      }}
      onDrag={(e) => {
        setIsBeingDragged(true);
      }}
      onDragEnd={(e) => {
        setIsBeingDragged(false);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer?.types.includes(DragTypes.Note)) {
          setAcceptDrop(false);
          return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = (rect.top + rect.bottom) / 2;
        const isTop = e.clientY < midpoint;

        setAcceptDrop(isTop ? "top" : "bottom");
      }}
      onDragExit={(e) => {
        setAcceptDrop(false);
      }}
      onDragLeave={(e) => {
        setAcceptDrop(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.types.includes(DragTypes.Note)) {
          const noteId = e.dataTransfer?.getData(DragTypes.Note) as
            | NoteId
            | undefined;

          action: if (noteId && noteId !== props.note.id) {
            if (acceptDrop() === "top") {
              if (props.previous && props.previous?.id === noteId) {
                break action;
              }
              moveNoteAction(
                noteId,
                props.note.column,
                getIndexBetween(props.previous?.order, props.note.order),
                new Date().getTime()
              );
            }

            if (acceptDrop() === "bottom") {
              if (props.previous && props.next?.id === noteId) {
                break action;
              }
              moveNoteAction(
                noteId,
                props.note.column,
                getIndexBetween(props.note.order, props.next?.order),
                new Date().getTime()
              );
            }
          }
        }

        setAcceptDrop(false);
      }}
    >
      <div>
        <RiEditorDraggable size={6} class="cursor-move" />
      </div>
      <textarea
        class="textarea textarea-ghost text-lg w-full"
        ref={input}
        style={{
          resize: "none",
        }}
        onBlur={(e) =>
          updateAction(
            props.note.id,
            (e.target as HTMLTextAreaElement).value,
            new Date().getTime()
          )
        }
      >
        {`${props.note.body}`}
      </textarea>
      <button
        class="btn btn-ghost btn-sm btn-circle"
        onClick={() => deleteAction(props.note.id, new Date().getTime())}
      >
        <BsTrash />
      </button>
    </div>
  );
}

export function AddNote(props: {
  column: ColumnId;
  length: number;
  onAdd: () => void;
  board: BoardId;
}) {
  const [active, setActive] = createSignal(false);
  const addNote = useAction(createNote);

  let inputRef: HTMLInputElement | undefined;

  return (
    <div class="w-full flex justify-center p-2">
      <Switch>
        <Match when={active()}>
          <form
            class="flex flex-col space-y-2 card w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const body = inputRef?.value.trim() ?? "Note";
              if (body === "") {
                inputRef?.setCustomValidity("Please fill out this field.");
                inputRef?.reportValidity();
                return;
              }
              addNote({
                id: crypto.randomUUID() as NoteId,
                board: props.board,
                column: props.column,
                body,
                order: props.length + 1,
                timestamp: new Date().getTime(),
              });
              inputRef && (inputRef.value = "");
              props.onAdd();
            }}
            onFocusOut={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as any)) {
                setActive(false);
              }
            }}
          >
            <input
              ref={(el) => {
                inputRef = el;
                setTimeout(() => requestAnimationFrame(() => void el.focus()));
              }}
              class="textarea dark:text-white"
              placeholder="Add a Note"
              required
            />
            <div class="flex justify-between">
              <button class="btn btn-success" type="submit">
                Add
              </button>
              <button
                class="btn btn-error"
                type="reset"
                onClick={() => setActive(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Match>
        <Match when={!active()}>
          <button class="btn w-full" onClick={() => setActive(true)}>
            <BsPlus size={10} /> Add a card
          </button>
        </Match>
      </Switch>
    </div>
  );
}
