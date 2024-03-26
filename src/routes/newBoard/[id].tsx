import { RouteDefinition, action, cache, createAsync } from "@solidjs/router";
import { Show } from "solid-js";
import { Board, type Actions } from "~/components/Board";
import { db } from "~/lib/tempDbForBoard";

const createColumn: Actions["createColumn"] = action(
  async (id, board, title) => {
    "use server";
    await db.read();
    db.data.columns.push({
      id,
      board: board,
      title: title,
      order: db.data.columns.length,
    });
    await db.write();
    return true;
  }
);

const renameColumn: Actions["renameColumn"] = action(
  async (id, title, timestamp) => {
    "use server";
    const index = db.data.columns.findIndex((c) => c.id === id);
    db.data.columns[index].title = title;
    await db.write();
    return true;
  }
);

const moveColumn: Actions["moveColumn"] = action(
  async (id, order, timestamp) => {
    "use server";
    const column = db.data.columns.find((c) => c.id === id);
    if (!column) return;
    column.order = order;
    await db.write();
    return;
  }
);

const deleteColumn: Actions["deleteColumn"] = action(
  async (id, timestamp: number) => {
    "use server";
    const index = db.data.columns.findIndex((c) => c.id === id);
    const deletedCol = db.data.columns.splice(index, 1);
    db.data.notes = db.data.notes.filter((n) => n.column !== deletedCol[0].id);
    await db.write();
    return true;
  }
);

const createNote: Actions["createNote"] = action(
  async ({ id, column, body, order, timestamp, board }) => {
    "use server";
    db.data.notes.push({
      id,
      board,
      column,
      order,
      body,
    });
    await db.write();
    return true;
  }
);

const editNote: Actions["editNote"] = action(async (id, content, timestamp) => {
  "use server";
  const index = db.data.notes.findIndex((n) => n.id === id);
  db.data.notes[index].body = content;
  await db.write();
  return true;
});

const moveNote: Actions["moveNote"] = action(
  async (note, column, order, timestamp) => {
    "use server";
    const index = db.data.notes.findIndex((n) => n.id === note);
    db.data.notes[index].column = column;
    db.data.notes[index].order = order;
    await db.write();
    return true;
  }
);

const deleteNote: Actions["deleteNote"] = action(async (id, timestamp) => {
  "use server";
  const index = db.data.notes.findIndex((n) => n.id === id);
  db.data.notes.splice(index, 1);
  await db.write();
  return true;
});

const fetchBoard = cache(async (id: number) => {
  "use server";
  console.log("fetching board", id);
  return db.read().then(() => db.data);
}, "board");

export const route: RouteDefinition = {
  load: () => fetchBoard(0),
};

export default function Page() {
  const board = createAsync(() => fetchBoard(0));

  return (
    <Show when={board()}>
      <div class="h-screen overflow-hidden">
        <Board
          board={board()!}
          actions={{
            createColumn,
            renameColumn,
            moveColumn,
            deleteColumn,
            createNote,
            editNote,
            moveNote,
            deleteNote,
          }}
        />
      </div>
    </Show>
  );
}
