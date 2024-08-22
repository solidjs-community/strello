import { Title } from "@solidjs/meta";
import {
  RouteDefinition,
  RouteSectionProps,
  action,
  cache,
  createAsync,
  useAction,
  useSubmission,
} from "@solidjs/router";
import { Show } from "solid-js";
import { Board, BoardData } from "~/components/Board";
import EditableText from "~/components/EditableText";
import { getAuthUser } from "~/lib/auth";
import { db } from "~/lib/db";

const fetchBoard = cache(async (boardId: number) => {
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

const updateBoardName = action(async (boardId: number, name: string) => {
  "use server";
  const accountId = await getAuthUser();

  return db.board.update({
    where: { id: boardId, accountId },
    data: { name },
  });
}, "update-board-name");

export const route: RouteDefinition = {
  load: (props) => fetchBoard(+props.params.id),
};

export default function Page(props: RouteSectionProps) {
  const board = createAsync(() => fetchBoard(+props.params.id));
  const submission = useSubmission(updateBoardName);
  const updateBoardNameAction = useAction(updateBoardName);

  return (
    <Show when={board()}>
      {(board) => (
        <main class="w-full p-8 space-y-2 bg-red-400">
          <Title>{board().board.title} | Strello</Title>

          <h1 class="mb-4">
            <EditableText
              text={
                (submission.input && submission.input[1]) ||
                board().board.title ||
                ""
              }
              saveAction={(value: string) =>
                updateBoardNameAction(+props.params.id, value)
              }
            />
          </h1>

          <div>
            <Board board={board()} />
          </div>
        </main>
      )}
    </Show>
  );
}
