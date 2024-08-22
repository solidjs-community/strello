import { action, cache, redirect } from "@solidjs/router";
import { db } from "./db";
import { login, register, validateEmail, validatePassword } from "./server";
import {
  getAuthUser,
  getSession,
  logoutSession,
  setAuthOnResponse,
} from "./auth";

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
    const user = await db.account.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    return { id: user.id, email: user.email };
  } catch {
    return redirect("/login");
  }
}, "user");

export const loginOrRegister = action(async (formData: FormData) => {
  "use server";
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateEmail(email) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await (loginType !== "login"
      ? register(email, password)
      : login(email, password));
    await setAuthOnResponse(user.id);
  } catch (err) {
    return err as Error;
  }
  return redirect("/");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/login");
});

export const getBoards = cache(async () => {
  "use server";
  const session = await getSession();
  const userId = session.data.userId;

  return db.board.findMany({
    where: {
      accountId: userId,
    },
  });
}, "get-boards");

export const addBoard = action(async (formData: FormData) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  const name = String(formData.get("name"));
  const color = String(formData.get("color"));

  const board = await db.board.create({
    data: {
      accountId: userId,
      name,
      color,
    },
  });

  return redirect(`/board/${board.id}`);
}, "add-board");

export const deleteBoard = action(async (boardId: number) => {
  "use server";
  const session = await getSession();
  const userId = session.data.userId;

  await db.board.delete({
    where: { id: boardId, accountId: userId },
  });
}, "delete-board");

export const redirectIfLoggedIn = cache(async () => {
  "use server";

  let userId = await getAuthUser();
  if (userId) {
    return redirect("/");
  }
  return null;
}, "loggedIn");
