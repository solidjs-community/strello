import { useAction } from "@solidjs/router";
import { BsPlus, BsTrash } from "solid-icons/bs";
import { RiEditorDraggable } from "solid-icons/ri";
import {
  For,
  Match,
  Switch,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import {
  createColumn,
  deleteColumn,
  moveColumn,
  moveNote,
  renameColumn,
} from "~/lib/queries";
import { Board, BoardId, DragTypes } from "./Board";
import { getIndexBetween } from "~/lib/utils";
import { AddNote, Note, NoteId } from "./Note";

export type ColumnId = string & { __brand?: "ColumnId" };

export type Column = {
  id: ColumnId;
  board: BoardId;
  title: string;
  order: number;
};

export function Column(props: { column: Column; board: Board; notes: Note[] }) {
  let parent: HTMLDivElement | undefined;

  const renameAction = useAction(renameColumn);
  const deleteAction = useAction(deleteColumn);
  const moveNoteAction = useAction(moveNote);

  const [acceptDrop, setAcceptDrop] = createSignal<boolean>(false);

  const filteredNotes = createMemo(() =>
    props.notes
      .filter((n) => n.column === props.column.id)
      .sort((a, b) => a.order - b.order)
  );

  return (
    <div
      draggable="true"
      class="w-full h-full max-w-[300px] shrink-0 card"
      style={{
        border:
          acceptDrop() === true ? "2px solid red" : "2px solid transparent",
      }}
      onDragStart={(e) => {
        e.dataTransfer?.setData(DragTypes.Column, props.column.id);
      }}
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => {
        e.preventDefault();
        if (e.dataTransfer?.types.includes(DragTypes.Note)) {
          setAcceptDrop(true);
          return;
        }
      }}
      onDragLeave={(e) => setAcceptDrop(false)}
      onDragExit={(e) => setAcceptDrop(false)}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer?.types.includes(DragTypes.Note)) {
          const noteId = e.dataTransfer?.getData(DragTypes.Note) as
            | NoteId
            | undefined;
          if (noteId && !filteredNotes().find((n) => n.id === noteId)) {
            moveNoteAction(
              noteId,
              props.column.id,
              getIndexBetween(
                filteredNotes()[filteredNotes().length - 1]?.order,
                undefined
              ),
              new Date().getTime()
            );
          }
        }
        setAcceptDrop(false);
      }}
    >
      <div class="card card-side flex items-center bg-base-300 px-2 py-2 mb-2 space-x-1">
        <div>
          <RiEditorDraggable size={6} class="cursor-move" />
        </div>
        <input
          class="input input-ghost text-2xl font-bold w-full"
          value={props.column.title}
          required
          onBlur={(e) => {
            if (e.target.reportValidity()) {
              renameAction(
                props.column.id,
                e.target.value,
                new Date().getTime()
              );
            }
          }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              // @ts-expect-error maybe use currentTarget?
              e.target.blur();
            }
          }}
        />
        <button
          class="btn btn-ghost btn-sm btn-circle"
          onClick={() => deleteAction(props.column.id, new Date().getTime())}
        >
          <BsTrash />
        </button>
      </div>
      <div
        class="flex h-full flex-col space-y-2 overflow-y-auto px-1"
        ref={parent}
      >
        <For each={filteredNotes()}>
          {(n, i) => (
            <Note
              note={n}
              previous={filteredNotes()[i() - 1]}
              next={filteredNotes()[i() + 1]}
            />
          )}
        </For>
      </div>
      <div class="py-2" />
      <AddNote
        column={props.column.id}
        board={props.board.id}
        length={props.notes.length}
        onAdd={() => {
          parent && (parent.scrollTop = parent.scrollHeight);
        }}
      />
    </div>
  );
}

export function ColumnGap(props: { left?: Column; right?: Column }) {
  const [active, setActive] = createSignal(false);
  const moveColumnAction = useAction(moveColumn);
  return (
    <div
      class="w-10 h-full mx-1 rounded-lg transition"
      style={{
        background: "red",
        opacity: active() ? 0.2 : 0,
      }}
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(true);
      }}
      onDragLeave={(e) => setActive(false)}
      onDragExit={(e) => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);

        if (e.dataTransfer?.types.includes(DragTypes.Column)) {
          const columnId = e.dataTransfer?.getData(DragTypes.Column) as
            | ColumnId
            | undefined;
          if (columnId) {
            if (columnId === props.left?.id || columnId === props.right?.id)
              return;
            const newOrder = getIndexBetween(
              props.left?.order,
              props.right?.order
            );
            moveColumnAction(columnId, newOrder, new Date().getTime());
          }
        }
      }}
    />
  );
}

export function AddColumn(props: { board: BoardId; onAdd: () => void }) {
  const [active, setActive] = createSignal(false);

  const addColumn = useAction(createColumn);

  let inputRef: HTMLInputElement | undefined;
  let plusRef: HTMLButtonElement | undefined;

  onMount(() => {
    plusRef?.focus();
  });

  return (
    <Switch>
      <Match when={active()}>
        <form
          onSubmit={(e) => (
            e.preventDefault(),
            addColumn(
              crypto.randomUUID() as ColumnId,
              props.board,
              inputRef?.value ?? "Column",
              new Date().getTime()
            ),
            inputRef && (inputRef.value = ""),
            props.onAdd()
          )}
          class="flex flex-col space-y-2 card bg-base-200 p-2 w-full max-w-[300px]"
        >
          <input
            ref={(el) => {
              (inputRef = el),
                setTimeout(() => requestAnimationFrame(() => el.focus()));
            }}
            class="input"
            placeholder="Add a Column"
            required
          />
          <div class="space-x-2">
            <button type="submit" class="btn btn-success">
              Add
            </button>
            <button
              type="reset"
              class="btn btn-error"
              onClick={() => setActive(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Match>
      <Match when={!active()}>
        <button
          ref={plusRef}
          class="btn btn-circle"
          onClick={() => setActive(true)}
        >
          <BsPlus size={10} />
        </button>
      </Match>
    </Switch>
  );
}
