import { db } from "~/lib/db";
import { action, cache } from "@solidjs/router";
import { getAuthUser } from "./auth";

export const deleteCard = action(async (id: string, accountId: string) => {
    "use server";
    return db.item.delete({ where: { id, Board: { accountId } } });
}, "delete-card");

export const getBoardData = cache(async (boardId: number) => {
    "use server";
    const accountId = await getAuthUser();

    return db.board.findUnique({
        where: {
            id: boardId,
            accountId,
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
) => {
    "use server";
    const accountId = await getAuthUser();

    return db.board.update({
        where: { id: boardId, accountId },
        data: { name },
    });
}, "update-board-name");

export const upsertItem = action(async (formData: FormData) => {
    "use server";
    const accountId = await getAuthUser();
    const mutation = {
        id: String(formData.get('id')),
        title: String(formData.get('title')),
        order: 1,
        boardId: 14,
        columnId: '3432'
    }

    console.log(mutation);

    // return db.item.upsert({
    //     where: {
    //         id: mutation.id,
    //         Board: {
    //             accountId,
    //         },
    //     },
    //     create: mutation,
    //     update: mutation,
    // });
}, 'upsert-item');

export const updateColumnName = action(async (
    id: string,
    name: string,
) => {
    "use server";
    const accountId = await getAuthUser();

    return db.column.update({
        where: { id, Board: { accountId } },
        data: { name },
    });
});

export const createColumn = action(async (
    boardId: number,
    name: string,
    id: string,
) => {
    "use server";

    const accountId = await getAuthUser();

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
