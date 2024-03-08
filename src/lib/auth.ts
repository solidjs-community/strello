import { redirect } from "@solidjs/router";
import { useSession } from "vinxi/http";

type UserSession = {
  userId?: string;
};

let secret = process.env.COOKIE_SECRET || "default";
if (secret === "default") {
  console.warn(
    "🚨 No COOKIE_SECRET environment variable set, using default. The app is insecure in production."
  );
  secret = "default-secret";
}

export function getUserSession() {
  return useSession({
    password: secret,
  });
}

export async function getAuthFromRequest() {
  const session = await getUserSession();
  const userId = session.data.userId;
  if (!userId) return null;
  return userId;
}

export async function setAuthOnResponse(userId: string) {
  const session = await getUserSession();
  await session.update((user: UserSession) => ((user.userId = userId), user));
}

export async function requireAuth() {
  let userId = await getAuthFromRequest();
  if (!userId) {
    await logout();
  }
  return userId;
}

export async function logout() {
  const session = await getUserSession();
  await session.update((user: UserSession) => (user.userId = undefined));
  throw redirect("/login");
}
