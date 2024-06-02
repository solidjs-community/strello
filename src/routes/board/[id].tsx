import { Title } from "@solidjs/meta";
import { RouteDefinition, RouteSectionProps, createAsync, useAction, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";
import { Board } from "~/components/Board";
import EditableText from "~/components/EditableText";
import { fetchBoard, createColumn, renameColumn, moveColumn, deleteColumn, deleteNote, createNote, editNote, moveNote, updateBoardName } from "~/lib/queries";

export const route: RouteDefinition = {
  load: (props) => fetchBoard(+props.params.id),
};

export default function Page(props: RouteSectionProps) {
  const board = createAsync(() => fetchBoard(+props.params.id));
  const submission = useSubmission(updateBoardName);
  const updateBoardNameAction = useAction(updateBoardName);

  return (
    <Show when={board()}>
      <main class="w-full px-8 space-y-2">
        <Title>{board()?.board.title} | Strello</Title>

        <h1 class=" mb-4">
          <EditableText
            text={submission.input && submission.input[1] || board()?.board.title || ''}
            saveAction={(value: string) => updateBoardNameAction(+props.params.id, value)}
          />
        </h1>

        <div>
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
      </main>
    </Show>
  );
}
