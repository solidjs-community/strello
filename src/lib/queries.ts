import { db } from "~/lib/db";
import { action, cache } from "@solidjs/router";

export const deleteCard = action(async () => (id: string, accountId: string) => {
    "use server";
    return db.item.delete({ where: { id, Board: { accountId } } });
}, "delete-card");

export const getBoardData = cache((boardId: number, accountId: string) => {
    "use server";
    return db.board.findUnique({
        where: {
            id: boardId,
            accountId: accountId,
        },
        include: {
            items: true,
            columns: { orderBy: { order: "asc" } },
        },
    });
}, 'get-board-data');

export const updateBoardName = action(async (
    boardId: number,
    name: string,
    accountId: string,
) => {
    "use server";
    return db.board.update({
        where: { id: boardId, accountId: accountId },
        data: { name },
    });
}, "update-board-name");

export function upsertItem(
    mutation: any,
    accountId: string,
) {
    "use server";
    return db.item.upsert({
        where: {
            id: mutation.id,
            Board: {
                accountId,
            },
        },
        create: mutation,
        update: mutation,
    });
}

export const updateColumnName = action(async (
    id: string,
    name: string,
    accountId: string,
) => {
    "use server";
    return db.column.update({
        where: { id, Board: { accountId } },
        data: { name },
    });
});

export const createColumn = action(async (
    boardId: number,
    name: string,
    id: string,
    accountId: string,
) => {
    "use server";
    let columnCount = await db.column.count({
        where: { boardId, Board: { accountId } },
    });
    return db.column.create({
        data: {
            id,
            boardId,
            name,
            order: columnCount + 1,
        },
    });
}, 'create-column');
