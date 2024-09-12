import { useSession } from "vinxi/http";

type UserSession = {
  userId?: string;
};

let secret = process.env.SESSION_SECRET || "default";
if (secret === "default") {
  console.warn(
    "🚨 No COOKIE_SECRET environment variable set, using default. The app is insecure in production."
  );
}

export function getSession() {
  return useSession({
    password:
      process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace",
  });
}

export async function getAuthUser() {
  const session = await getSession();
  const userId = session.data.userId;
  if (!userId) return null;
  return userId;
}

export async function setAuthOnResponse(userId: string) {
  const session = await getSession();
  await session.update((user: UserSession) => ((user.userId = userId), user));
}

export async function logoutSession() {
  const session = await getSession();
  await session.update((user: UserSession) => (user.userId = undefined));
}
