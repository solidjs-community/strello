import { action, cache, redirect } from "@solidjs/router";
import { db } from "./db";
import { login, register, validateEmail, validatePassword } from "./server";
import { getAuthUser, logoutSession, setAuthOnResponse } from "./auth";

export const getUser = cache(async () => {
  "use server";
  const userId = await getAuthUser();
  if (!userId) throw redirect("/login");
  const user = await db.account.findUnique({ where: { id: userId } });
  if (!user) throw redirect("/login");
  return { id: user.id, email: user.email };
}, "user");

export const loginOrRegister = action(async (formData: FormData) => {
  "use server";
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateEmail(email) || validatePassword(password);
  if (error) throw new Error(error);

  try {
    const user = await (loginType !== "login"
      ? register(email, password)
      : login(email, password));
    await setAuthOnResponse(user.id);
  } catch (err) {
    throw err as Error;
  }
  throw redirect("/");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  throw redirect("/login");
});

export const redirectIfLoggedIn = cache(async () => {
  "use server";

  let userId = await getAuthUser();
  if (userId) {
    throw redirect("/");
  }
  return null;
}, "loggedIn");
