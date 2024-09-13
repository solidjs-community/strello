import { Title } from "@solidjs/meta";
import {
  RouteDefinition,
  RouteSectionProps,
  action,
  createAsync,
  useAction,
  useSubmission,
} from "@solidjs/router";
import { Show } from "solid-js";
import { Board } from "~/components/Board";
import EditableText from "~/components/EditableText";
import { fetchBoard } from "~/lib";
import { getAuthUser } from "~/lib/auth";
import { db } from "~/lib/db";

const updateBoardName = action(async (boardId: number, name: string) => {
  "use server";
  const accountId = await getAuthUser();

  return db.board.update({
    where: { id: boardId, accountId },
    data: { name },
  });
}, "update-board-name");

export const route: RouteDefinition = {
  preload: (props) => fetchBoard(+props.params.id),
};

export default function Page(props: RouteSectionProps) {
  const board = createAsync(() => fetchBoard(+props.params.id));
  const submission = useSubmission(updateBoardName);
  const updateBoardNameAction = useAction(updateBoardName);

  return (
    <Show when={board()}>
      {(board) => (
        <main
          class="w-full p-8 space-y-2"
          style={{ "background-color": board().board.color }}
        >
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
