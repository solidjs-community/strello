import { db } from "~/lib/db";
import { action, cache } from "@solidjs/router";
import { getAuthUser } from "./auth";
import { Actions, BoardData } from "~/components/Board";

export const fetchBoard = cache(async (boardId: number) => {
  "use server";
  const accountId = await getAuthUser();

  const boardFromDataBase = await db.board.findUnique({
    where: {
      id: boardId,
      accountId,
    },
    include: {
      items: true,
      columns: { orderBy: { order: "asc" } },
    },
  });

  // mapping the db to what the board expects
  return {
    board: {
      id: String(boardFromDataBase?.id),
      title: String(boardFromDataBase?.name),
    },
    notes:
      boardFromDataBase?.items.map((note) => ({
        ...note,
        board: String(note.boardId),
        column: note.columnId,
        body: note.title || "",
      })) || [],
    columns:
      boardFromDataBase?.columns.map((column) => ({
        ...column,
        board: String(column.boardId),
        title: column.name,
      })) || [],
  } satisfies BoardData;
}, "get-board-data");

export const updateBoardName = action(async (boardId: number, name: string) => {
  "use server";
  const accountId = await getAuthUser();

  return db.board.update({
    where: { id: boardId, accountId },
    data: { name },
  });
}, "update-board-name");

export const createNote: Actions["createNote"] = action(
  async ({ id, column, body, order, timestamp, board }) => {
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

    return true;
  },
  "create-item"
);

export const editNote: Actions["editNote"] = action(
  async (id, content, timestamp) => {
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

    return true;
  },
  "edit-item"
);

export const moveNote: Actions["moveNote"] = action(
  async (note, column, order, timestamp) => {
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

    return true;
  },
  "move-item"
);

export const renameColumn: Actions["renameColumn"] = action(
  async (id: string, name: string) => {
    "use server";
    const accountId = await getAuthUser();

    await db.column.update({
      where: { id, Board: { accountId } },
      data: { name },
    });

    return true;
  }
);

export const createColumn: Actions["createColumn"] = action(
  async (id: string, board: string, name: string) => {
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

    return true;
  },
  "create-column"
);

export const moveColumn: Actions["moveColumn"] = action(
  async (id, order, timestamp) => {
    "use server";
    const accountId = await getAuthUser();

    await db.column.update({
      where: { id, Board: { accountId } },
      data: { order },
    });

    return;
  },
  "create-column"
);

export const deleteColumn: Actions["deleteColumn"] = action(
  async (id, timestamp) => {
    "use server";
    const accountId = await getAuthUser();

    await db.column.delete({
      where: { id, Board: { accountId } },
    });

    return true;
  },
  "create-column"
);

export const deleteNote: Actions["deleteNote"] = action(async (id: string) => {
  "use server";
  const accountId = await getAuthUser();

  await db.item.delete({ where: { id, Board: { accountId } } });

  return true;
}, "delete-card");
