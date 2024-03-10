import { action, createAsync, useSubmission, type RouteDefinition } from "@solidjs/router";
import { For } from "solid-js";
import { addBoard, deleteBoard, getBoards, getUser, logout } from "~/lib";

export const route = {
  load: () => {
    getUser();
    getBoards();
  }
} satisfies RouteDefinition;

export default function Home() {
  const user = createAsync(() => getUser(), { deferStream: true });
  const boards = createAsync(() => getBoards());
  const addBoardSubmission = useSubmission(addBoard);

  return (
    <main class="w-full p-4 space-y-2">
      <h2 class="font-bold text-3xl">Hello {user()?.email}</h2>
      <h3 class="font-bold text-xl">Message board</h3>
      <form action={logout} method="post">
        <button name="logout" type="submit">
          Logout
        </button>
      </form>

      <div class="h-full">
        <form action={addBoard} method="post" class="p-8 max-w-md">
          <div>
            <h2 class="font-bold mb-2 text-xl">New Board</h2>
            <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
            <div class="mt-2">
              <input name="name" type="text" required id="name" class="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-4">
            <div class="flex items-center gap-1">
              <label for="board-color" class="block text-sm font-medium leading-6 text-gray-900">Color</label>
              <input id="board-color" name="color" type="color" class="bg-transparent" value="#cbd5e1" />
            </div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-brand-blue px-1 py-1 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
              {addBoardSubmission.pending ? 'Creating' : 'Create'}
            </button>
          </div>
        </form>
        <div class="p-8">
          <h2 class="font-bold mb-2 text-xl">Boards</h2>
          <nav class="flex flex-wrap gap-8">
            <For each={boards()}>
              {(board) => (
                <a class="w-60 h-40 p-4 block border-b-8 shadow rounded hover:shadow-lg bg-white relative" href={`/board/${board.id}`} style={`border-color: ${board.color}`}>
                  <div class="font-bold">{board.name}</div>
                  <form action={deleteBoard.with(board.id)} method="post">
                    <button aria-label="Delete board" class="absolute top-4 right-4 hover:text-brand-red" type="submit">
                      Delete
                    </button>
                  </form>
                </a>
              )}
            </For>
          </nav>
        </div>
      </div>
    </main>
  );
}
