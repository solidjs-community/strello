import { RouteDefinition, RouteSectionProps, createAsync } from "@solidjs/router";
import { Show } from "solid-js";
import { Board } from "~/components/Board";
import { fetchBoard, createColumn, renameColumn, moveColumn, deleteColumn, deleteNote, createNote, editNote, moveNote } from "~/lib/queries";

export const route: RouteDefinition = {
  load: (props) => fetchBoard(+props.params.id),
};

export default function Page(props: RouteSectionProps) {
  const board = createAsync(() => fetchBoard(+props.params.id));

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
