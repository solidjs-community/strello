import { db } from "~/lib/db";
import { action, redirect } from "@solidjs/router";

export function deleteCard(id: string, accountId: string) {
    "use server";
    return db.item.delete({ where: { id, Board: { accountId } } });
}

export async function getBoardData(boardId: number, accountId: string) {
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
}

export const updateBoardName = action(async (
    boardId: number,
    name: string,
    accountId: string,
) => {
    "use server";
    await db.board.update({
        where: { id: boardId, accountId: accountId },
        data: { name },
    });

    return redirect('/');
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

export async function updateColumnName(
    id: string,
    name: string,
    accountId: string,
) {
    "use server";
    return db.column.update({
        where: { id, Board: { accountId } },
        data: { name },
    });
}
