import { action, json, useAction } from "@solidjs/router";
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
import { type Board, type BoardId, DragTypes } from "./Board";
import { getIndexBetween } from "~/lib/utils";
import { AddNote, Note, NoteId, moveNote } from "./Note";
import { getAuthUser } from "~/lib/auth";
import { db } from "~/lib/db";
import { fetchBoard } from "~/lib";

export const renameColumn = action(
  async (id: ColumnId, name: string, timestamp: number) => {
    "use server";
    const accountId = await getAuthUser();

    await db.column.update({
      where: { id, Board: { accountId } },
      data: { name },
    });

    return json(true, { revalidate: fetchBoard.key });
  }
);

export const createColumn = action(
  async (id: ColumnId, board: BoardId, name: string, timestamp: number) => {
    "use server";

    const accountId = await getAuthUser();

    let columnCount = await db.column.count({
      where: { boardId: +board, Board: { accountId } },
    });
    await db.column.create({
      data: {
        id,
        boardId: +board,
        name,
        order: columnCount + 1,
      },
    });

    return json(true, { revalidate: fetchBoard.key });
  },
  "create-column"
);

export const moveColumn = action(
  async (id: ColumnId, order: number, timestamp: number) => {
    "use server";
    const accountId = await getAuthUser();

    await db.column.update({
      where: { id, Board: { accountId } },
      data: { order },
    });

    return json(true, { revalidate: fetchBoard.key });
  },
  "create-column"
);

export const deleteColumn = action(async (id: ColumnId, timestamp: number) => {
  "use server";
  const accountId = await getAuthUser();

  await db.column.delete({
    where: { id, Board: { accountId } },
  });

  return json(true, { revalidate: fetchBoard.key });
}, "create-column");

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
      class="w-full max-w-[300px] shrink-0 card bg-slate-100 max-h-[75vh]"
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
      <div class="card card-side flex items-center bg-slate-100 px-2 py-2 mb-2 space-x-1">
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
      class="h-full rounded-lg transition min-w-5 w-10"
      style={{
        background: "red",
        opacity: active() ? 0.2 : 0,
      }}
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (
          e.dataTransfer?.types.includes(DragTypes.Column) &&
          e.dataTransfer?.types.length === 1
        ) {
          setActive(true);
        }
      }}
      onDragLeave={(e) => setActive(false)}
      onDragExit={(e) => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        if (
          e.dataTransfer?.types.includes(DragTypes.Column) &&
          e.dataTransfer?.types.length === 1
        ) {
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
          class="flex flex-col space-y-2 card bg-slate-100 p-2 w-full max-w-[300px]"
          onFocusOut={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as any)) {
              setActive(false);
            }
          }}
        >
          <input
            ref={(el) => {
              (inputRef = el),
                setTimeout(() => requestAnimationFrame(() => el.focus()));
            }}
            class="input dark:text-white"
            placeholder="Add a Column"
            required
          />
          <div class="flex justify-between">
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
