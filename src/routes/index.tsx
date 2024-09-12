import { Title } from "@solidjs/meta";
import {
  action,
  cache,
  createAsync,
  redirect,
  useSubmission,
  useSubmissions,
  type RouteDefinition,
} from "@solidjs/router";
import { BsTrash } from "solid-icons/bs";
import { For, Show, onMount } from "solid-js";
import { getUser } from "~/lib";
import { getAuthUser } from "~/lib/auth";
import { db } from "~/lib/db";

const addBoard = action(async (formData: FormData) => {
  "use server";

  const userId = await getAuthUser();

  const name = String(formData.get("name"));
  const color = String(formData.get("color"));

  const board = await db.board.create({
    data: {
      accountId: userId,
      name,
      color,
    },
  });

  throw redirect(`/board/${board.id}`);
}, "add-board");

const deleteBoard = action(async (boardId: number) => {
  "use server";
  const userId = await getAuthUser();

  await db.board.delete({
    where: { id: boardId, accountId: userId },
  });
}, "delete-board");

const getBoards = cache(async () => {
  "use server";
  const userId = await getAuthUser();

  if (!userId) {
    throw redirect("/login");
  }

  return db.board.findMany({
    where: {
      accountId: userId,
    },
  });
}, "get-boards");

export const route = {
  preload: () => {
    getUser();
    getBoards();
  },
} satisfies RouteDefinition;

export default function Home() {
  const user = createAsync(() => getUser());
  const serverBoards = createAsync(() => getBoards());
  const addBoardSubmission = useSubmission(addBoard);
  const deleteBoardSubmissions = useSubmissions(deleteBoard);

  const boards = () => {
    if (deleteBoardSubmissions.pending) {
      const deletedBoards: number[] = [];

      for (const sub of deleteBoardSubmissions) {
        deletedBoards.push(sub.input[0]);
      }

      return serverBoards()?.filter(
        (board) => !deletedBoards.includes(board.id)
      );
    }

    return serverBoards();
  };

  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    inputRef?.focus();
  });

  return (
    <main class="w-full p-8 space-y-2">
      <Show when={user()}>
        <Title>Boards | Strello</Title>

        <div class="h-full">
          <form action={addBoard} method="post" class="max-w-md">
            <div>
              <h2 class="w-full text-2xl font-medium block rounded-lg text-left border border-transparent pb-4">
                New Board
              </h2>
              <label for="name" class="block text-sm font-medium leading-6 ">
                Name
              </label>
              <div class="mt-2">
                <input
                  name="name"
                  ref={inputRef}
                  autofocus
                  type="text"
                  required
                  id="name"
                  class="dark:text-white px-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                  disabled={addBoardSubmission.pending}
                />
              </div>
            </div>
            <div class="mt-4 flex items-center gap-4">
              <div class="flex items-center gap-1">
                <label
                  for="board-color"
                  class="block text-sm font-medium leading-6"
                >
                  Color
                </label>
                <input
                  id="board-color"
                  name="color"
                  type="color"
                  class="bg-slate-800 bg-opacity-0 hover:bg-opacity-20 rounded"
                  value="#A2DEFF"
                  disabled={addBoardSubmission.pending}
                />
              </div>
              <button
                type="submit"
                class="flex w-full justify-center rounded-md bg-slate-900 text-white px-1 py-1 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:bg-slate-800"
                disabled={addBoardSubmission.pending}
              >
                {addBoardSubmission.pending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
          <div class="py-8">
            <h2 class="font-bold mb-2 text-xl">Boards</h2>
            <nav class="flex flex-wrap gap-8">
              <Show when={boards()?.length} fallback="No boards found.">
                <For each={boards()}>
                  {(board) => (
                    <div class="relative">
                      <a
                        class="w-60 h-40 p-4 block border-b-8 shadow rounded hover:shadow-lg bg-slate-50 relative "
                        href={`/board/${board.id}`}
                        style={`border-color: ${board.color}`}
                      >
                        <div class="font-bold">{board.name}</div>
                      </a>

                      <form
                        class="absolute top-2.5 right-2.5"
                        action={deleteBoard.with(board.id)}
                        method="post"
                      >
                        <button
                          aria-label="Delete board"
                          class="btn btn-ghost btn-sm btn-circle"
                          type="submit"
                        >
                          <BsTrash />
                        </button>
                      </form>
                    </div>
                  )}
                </For>
              </Show>
            </nav>
          </div>
        </div>
      </Show>
    </main>
  );
}
