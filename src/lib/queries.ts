'use server';

import { db } from "~/lib/db";

import { ItemMutation } from "./types";
import { action } from "@solidjs/router";

export function deleteCard(id: string, accountId: string) {
    return db.item.delete({ where: { id, Board: { accountId } } });
}

export async function getBoardData(boardId: number, accountId: string) {
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

export const updateBoardName = action((
    boardId: number,
    name: string,
    accountId: string,
) => {
    return db.board.update({
        where: { id: boardId, accountId: accountId },
        data: { name },
    });
}, "update-board-name");

export function upsertItem(
    mutation: ItemMutation & { boardId: number },
    accountId: string,
) {
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
    return db.column.update({
        where: { id, Board: { accountId } },
        data: { name },
    });
}

export async function createColumn(
    boardId: number,
    name: string,
    id: string,
    accountId: string,
) {
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
}