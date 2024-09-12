import { Action, useSubmissions } from "@solidjs/router";
import { For, batch, createEffect, createMemo, untrack } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";
import {
  AddColumn,
  Column,
  ColumnGap,
  ColumnId,
  createColumn,
  deleteColumn,
  moveColumn,
  renameColumn,
} from "./Column";
import {
  Note,
  NoteId,
  createNote,
  deleteNote,
  editNote,
  moveNote,
} from "./Note";

export enum DragTypes {
  Note = "application/note",
  Column = "application/column",
}

export type BoardId = string & { __brand?: "BoardId" };

export type Board = {
  id: BoardId;
  title: string;
  color: string;
};

export type BoardData = {
  board: Board;
  columns: Column[];
  notes: Note[];
};

type Mutation =
  | {
      type: "createNote";
      id: NoteId;
      column: ColumnId;
      board: BoardId;
      body: string;
      order: number;
      timestamp: number;
    }
  | {
      type: "editNote";
      id: NoteId;
      content: string;
      timestamp: number;
    }
  | {
      type: "moveNote";
      id: NoteId;
      column: ColumnId;
      order: number;
      timestamp: number;
    }
  | {
      type: "deleteNote";
      id: NoteId;
      timestamp: number;
    }
  | {
      type: "createColumn";
      id: ColumnId;
      board: string;
      title: string;
      timestamp: number;
    }
  | {
      type: "renameColumn";
      id: ColumnId;
      title: string;
      timestamp: number;
    }
  | {
      type: "moveColumn";
      id: ColumnId;
      order: number;
      timestamp: number;
    }
  | {
      type: "deleteColumn";
      id: ColumnId;
      timestamp: number;
    };

export function Board(props: { board: BoardData }) {
  const [boardStore, setBoardStore] = createStore({
    columns: props.board.columns,
    notes: props.board.notes,
    timestamp: 0,
  });

  const createNoteSubmission = useSubmissions(createNote);
  const editNoteSubmission = useSubmissions(editNote);
  const moveNoteSubmission = useSubmissions(moveNote);
  const deleteNoteSubmission = useSubmissions(deleteNote);
  const createColumnSubmission = useSubmissions(createColumn);
  const renameColumnSubmission = useSubmissions(renameColumn);
  const moveColumnSubmission = useSubmissions(moveColumn);
  const deleteColumnSubmission = useSubmissions(deleteColumn);

  function getMutations() {
    const mutations: Mutation[] = [];

    for (const note of createNoteSubmission.values()) {
      if (!note.pending) continue;
      const [{ id, column, body, order, timestamp }] = note.input;
      mutations.push({
        type: "createNote",
        board: props.board.board.id,
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

    return mutations;
  }

  createEffect(() => {
    const mutations = untrack(() => getMutations());

    const { notes, columns } = props.board;
    applyMutations(mutations, notes, columns);

    console.log(
      `got server data, reset the board with mutations`,
      ...mutations
    );

    batch(() => {
      setBoardStore("notes", reconcile(notes));
      setBoardStore("columns", reconcile(columns));
      setBoardStore("timestamp", Date.now());
    });
  });

  createEffect(() => {
    const mutations = getMutations();
    const prevTimestamp = untrack(() => boardStore.timestamp);
    const latestMutations = mutations.filter(
      (m) => m.timestamp > prevTimestamp
    );

    console.log(
      `found submission, apply optimistic update with mutations`,
      ...latestMutations
    );

    if (!optimisticUpdates) return console.log(`Skipping optimistic update`);

    setBoardStore(
      produce((b) => {
        applyMutations(latestMutations, b.notes, b.columns);
        b.timestamp = Date.now();
      })
    );
  });

  const sortedColumns = createMemo(() =>
    boardStore.columns.slice().sort((a, b) => a.order - b.order)
  );

  let scrollContainerRef: HTMLDivElement | undefined;

  return (
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
            <Column
              column={column}
              board={props.board.board}
              notes={boardStore.notes}
            />
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
  );
}

function applyMutations(
  mutations: Mutation[],
  notes: Note[],
  columns: Column[]
) {
  for (const mut of mutations.sort((a, b) => a.timestamp - b.timestamp)) {
    switch (mut.type) {
      case "createNote": {
        const index = notes.findIndex((n) => n.id === mut.id);
        if (index === -1)
          notes.push({
            id: mut.id,
            column: mut.column,
            body: mut.body,
            order: mut.order,
            board: mut.board,
          });
        break;
      }
      case "moveNote": {
        const index = notes.findIndex((n) => n.id === mut.id);
        if (index !== -1) {
          notes[index].column = mut.column;
          notes[index].order = mut.order;
        }
        break;
      }
      case "editNote": {
        const index = notes.findIndex((n) => n.id === mut.id);
        if (index !== -1) notes[index].body = mut.content;
        break;
      }
      case "deleteNote": {
        const index = notes.findIndex((n) => n.id === mut.id);
        if (index !== -1) notes.splice(index, 1);
        break;
      }
      case "createColumn": {
        const index = columns.findIndex((c) => c.id === mut.id);
        if (index === -1)
          columns.push({
            id: mut.id,
            board: mut.board,
            title: mut.title,
            order: columns.length + 1,
          });
        break;
      }
      case "renameColumn": {
        const index = columns.findIndex((c) => c.id === mut.id);
        if (index !== -1) columns[index].title = mut.title;
        break;
      }
      case "moveColumn": {
        const index = columns.findIndex((c) => c.id === mut.id);
        if (index !== -1) columns[index].order = mut.order;
        break;
      }
      case "deleteColumn": {
        const index = columns.findIndex((c) => c.id === mut.id);
        if (index !== -1) columns.splice(index, 1);
        break;
      }
    }
  }
}

let optimisticUpdates = true;
if (typeof window !== "undefined") {
  // disable optimistic updates in production for testing/demonstration purposes
  // @ts-expect-error
  window.toggleOptimistic = () => {
    optimisticUpdates = !optimisticUpdates;
  };
}
