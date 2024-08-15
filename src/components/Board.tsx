import {
  For,
  Match,
  Switch,
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount,
  useContext,
} from "solid-js";
import { Action, useAction, useSubmissions } from "@solidjs/router";
import { BsPlus, BsThreeDotsVertical, BsTrash } from "solid-icons/bs";
import { RiEditorDraggable } from "solid-icons/ri";
import { createStore, reconcile } from "solid-js/store";
import { createAutoAnimate } from "@formkit/auto-animate/solid";
import {
  createColumn,
  renameColumn,
  moveColumn,
  deleteColumn,
  deleteNote,
  createNote,
  editNote,
  moveNote,
} from "~/lib/queries";

const actions = {
  createColumn,
  renameColumn,
  moveColumn,
  deleteColumn,
  createNote,
  editNote,
  moveNote,
  deleteNote,
};

enum DragTypes {
  Note = "application/note",
  Column = "application/column",
}

export type ID = string;
export type Order = number;

export type Note = {
  id: ID;
  board: ID;
  column: ID;
  order: Order;
  body: string;
};

export type Column = {
  id: ID;
  board: ID;
  title: string;
  order: Order;
};

function getIndicesBetween(
  below: number | undefined,
  above: number | undefined,
  n: number = 1
) {
  let start: number;
  let step: number;
  if (typeof below === "number" && below === above) {
    throw new Error(`below ${below} and above ${above} cannot be the same`);
  }
  if (below !== undefined && above !== undefined) {
    // Put items between
    step = (above - below) / (n + 1);
    start = below + step;
  } else if (below === undefined && above !== undefined) {
    // Put items below (bottom of the list)
    step = above / (n + 1);
    start = step;
  } else if (below !== undefined && above === undefined) {
    // Put items above (top of the list)
    start = below + 1;
    step = 1;
  } else {
    return Array.from(Array(n)).map((_, i) => i + 1);
  }
  return Array.from(Array(n)).map((_, i) => start + i * step);
}
const getIndexBetween = (
  below: number | undefined,
  above: number | undefined
) => getIndicesBetween(below, above, 1)[0];

export type Board = {
  id: ID;
  title: string;
};

export type BoardData = {
  board: Board;
  columns: Column[];
  notes: Note[];
};

export type Actions = {
  createColumn: Action<
    [id: ID, board: ID, title: string, timestamp: number],
    boolean
  >;
  renameColumn: Action<[id: ID, title: string, timestamp: number], boolean>;
  moveColumn: Action<[column: ID, order: Order, timestamp: number], void>;
  deleteColumn: Action<[id: ID, timestamp: number], boolean>;
  createNote: Action<
    [
      {
        id: ID;
        board: ID;
        column: ID;
        body: string;
        order: Order;
        timestamp: number;
      }
    ],
    boolean
  >;
  editNote: Action<[id: ID, content: string, timestamp: number], boolean>;
  moveNote: Action<
    [note: ID, column: ID, order: number, timestamp: number],
    boolean
  >;
  deleteNote: Action<[id: ID, timestamp: number], boolean>;
};

const BoardContext = createContext<
  | {
      board: Board;
      columns: Column[];
      notes: Note[];
    }
  | undefined
>();

const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("No board context provided. This is a bug.");
  return context;
};

export function Board(props: { board: BoardData }) {
  const [boardStore, setBoardStore] = createStore({
    board: props.board.board,
    columns: props.board.columns,
    notes: props.board.notes,
  });

  const createNoteSubmission = useSubmissions(actions.createNote);
  const editNoteSubmission = useSubmissions(actions.editNote);
  const moveNoteSubmission = useSubmissions(actions.moveNote);
  const deleteNoteSubmission = useSubmissions(actions.deleteNote);
  const createColumnSubmission = useSubmissions(actions.createColumn);
  const renameColumnSubmission = useSubmissions(actions.renameColumn);
  const moveColumnSubmission = useSubmissions(actions.moveColumn);
  const deleteColumnSubmission = useSubmissions(actions.deleteColumn);

  createEffect(() => {
    const mutations: any[] = [];

    for (const note of createNoteSubmission.values()) {
      if (!note.pending) continue;
      const [{ id, column, body, order, timestamp }] = note.input;
      mutations.push({
        type: "createNote",
        id,
        column,
        body,
        order,
        timestamp,
      });
    }

    for (const note of editNoteSubmission.values()) {
      if (!note.pending) continue;
      const [id, content, timestamp] = note.input;
      mutations.push({
        type: "editNote",
        id,
        content,
        timestamp,
      });
    }

    for (const note of moveNoteSubmission.values()) {
      if (!note.pending) continue;
      const [id, column, order, timestamp] = note.input;
      mutations.push({
        type: "moveNote",
        id,
        column,
        order,
        timestamp,
      });
    }

    for (const note of deleteNoteSubmission.values()) {
      if (!note.pending) continue;
      const [id, timestamp] = note.input;
      mutations.push({
        type: "deleteNote",
        id,
        timestamp,
      });
    }

    for (const column of createColumnSubmission.values()) {
      if (!column.pending) continue;
      const [id, board, title, timestamp] = column.input;
      mutations.push({
        type: "createColumn",
        id,
        board,
        title,
        timestamp,
      });
    }

    for (const column of renameColumnSubmission.values()) {
      if (!column.pending) continue;
      const [id, title, timestamp] = column.input;
      mutations.push({
        type: "renameColumn",
        id,
        title,
        timestamp,
      });
    }

    for (const column of moveColumnSubmission.values()) {
      if (!column.pending) continue;
      const [id, order, timestamp] = column.input;
      mutations.push({
        type: "moveColumn",
        id,
        order,
        timestamp,
      });
    }

    for (const column of deleteColumnSubmission.values()) {
      if (!column.pending) continue;
      const [id, timestamp] = column.input;
      mutations.push({
        type: "deleteColumn",
        id,
        timestamp,
      });
    }

    const newNotes = [...props.board.notes];
    const newColumns = [...props.board.columns];
    const newBoard = Object.assign({}, props.board.board);

    for (const mut of mutations.sort((a, b) => a.timestamp - b.timestamp)) {
      switch (mut.type) {
        case "createNote": {
          newNotes.push({
            id: mut.id,
            column: mut.column,
            body: mut.body,
            order: mut.order,
            board: props.board.board.id,
          });
          break;
        }
        case "moveNote": {
          const index = newNotes.findIndex((n) => n.id === mut.id);
          if (index === -1) break;
          newNotes[index] = {
            ...newNotes[index],
            column: mut.column,
            order: mut.order,
          };
          break;
        }
        case "editNote": {
          const index = newNotes.findIndex((n) => n.id === mut.id);
          if (index === -1) break;
          newNotes[index] = { ...newNotes[index], body: mut.content };
          break;
        }
        case "deleteNote": {
          const index = newNotes.findIndex((n) => n.id === mut.id);
          if (index === -1) break;
          newNotes.splice(index, 1);
          break;
        }
        case "createColumn": {
          newColumns.push({
            id: mut.id,
            board: mut.board,
            title: mut.title,
            order: newColumns.length + 1,
          });
          break;
        }
        case "renameColumn": {
          const index = newColumns.findIndex((c) => c.id === mut.id);
          if (index === -1) break;
          newColumns[index] = { ...newColumns[index], title: mut.title };
          break;
        }
        case "moveColumn": {
          const index = newColumns.findIndex((c) => c.id === mut.id);
          if (index === -1) break;
          newColumns[index] = { ...newColumns[index], order: mut.order };
          break;
        }
        case "deleteColumn": {
          const index = newColumns.findIndex((c) => c.id === mut.id);
          if (index === -1) break;
          newColumns.splice(index, 1);
          break;
        }
      }
    }

    batch(() => {
      setBoardStore("notes", reconcile(newNotes));
      setBoardStore("columns", reconcile(newColumns));
      setBoardStore("board", reconcile(newBoard));
    });
  });

  const sortedColumns = createMemo(() =>
    boardStore.columns.slice().sort((a, b) => a.order - b.order)
  );

  let scrollContainerRef: HTMLDivElement | undefined;

  return (
    <BoardContext.Provider value={boardStore}>
      <div
        ref={(el) => {
          scrollContainerRef = el;
        }}
        class="pb-8 h-[calc(100vh-160px)] min-w-full overflow-x-auto overflow-y-hidden flex flex-start items-start flex-nowrap"
      >
        <ColumnGap right={sortedColumns()[0]} />
        <For each={sortedColumns()}>
          {(column, i) => (
            <>
              <Column column={column} board={props.board.board} />
              <ColumnGap
                left={sortedColumns()[i()]}
                right={sortedColumns()[i() + 1]}
              />
            </>
          )}
        </For>
        <AddColumn
          board={props.board.board.id}
          onAdd={() => {
            scrollContainerRef &&
              (scrollContainerRef.scrollLeft = scrollContainerRef.scrollWidth);
          }}
        />
      </div>
    </BoardContext.Provider>
  );
}

function ColumnGap(props: { left?: Column; right?: Column }) {
  const [active, setActive] = createSignal(false);
  const ctx = useBoard();
  const moveColumnAction = useAction(actions.moveColumn);
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
          const columnId = e.dataTransfer?.getData(DragTypes.Column);
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

function Column(props: { column: Column; board: Board }) {
  const ctx = useBoard();

  let parent: HTMLDivElement | undefined;

  const renameAction = useAction(actions.renameColumn);
  const deleteAction = useAction(actions.deleteColumn);
  const moveNoteAction = useAction(actions.moveNote);

  const [acceptDrop, setAcceptDrop] = createSignal<boolean>(false);

  const filteredNotes = createMemo(() =>
    ctx.notes
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
          const noteId = e.dataTransfer?.getData(DragTypes.Note);
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
        board={+props.board.id}
        length={ctx.notes.length}
        onAdd={() => {
          parent && (parent.scrollTop = parent.scrollHeight);
        }}
      />
    </div>
  );
}

function Note(props: { note: Note; previous?: Note; next?: Note }) {
  const updateAction = useAction(actions.editNote);
  const deleteAction = useAction(actions.deleteNote);
  const moveNoteAction = useAction(actions.moveNote);

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
      class="card card-side px-1 py-2 w-full bg-base-200 text-lg flex justify-between items-center space-x-1"
      onDragStart={(e) => {
        e.dataTransfer?.setData("application/note", props.note.id.toString());
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
        if (e.dataTransfer?.types.includes("application/note")) {
          const noteId = e.dataTransfer?.getData("application/note");

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

function AddNote(props: {
  column: ID;
  length: number;
  onAdd: () => void;
  board: number;
}) {
  const [active, setActive] = createSignal(false);
  const addNote = useAction(actions.createNote);
  let inputRef: HTMLInputElement | undefined;
  return (
    <div class="w-full flex justify-center">
      <Switch>
        <Match when={active()}>
          <form
            class="flex flex-col space-y-2 card bg-base-200 p-2 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              addNote({
                id: crypto.randomUUID(),
                board: String(props.board),
                column: props.column,
                body: inputRef?.value ?? "Note",
                order: props.length + 1,
                timestamp: new Date().getTime(),
              });
              inputRef && (inputRef.value = "");
              props.onAdd();
            }}
          >
            <input
              ref={(el) => {
                inputRef = el;
                setTimeout(() => requestAnimationFrame(() => void el.focus()));
              }}
              class="textarea"
              placeholder="Add a Note"
              required
            />
            <div class="space-x-2">
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
          <button class="btn btn-circle" onClick={() => setActive(true)}>
            <BsPlus size={10} />
          </button>
        </Match>
      </Switch>
    </div>
  );
}

function AddColumn(props: { board: ID; onAdd: () => void }) {
  const [active, setActive] = createSignal(false);

  const addColumn = useAction(actions.createColumn);

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
              crypto.randomUUID(),
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
