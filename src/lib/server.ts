import { db } from "./db";
import crypto from "crypto";

export function validateEmail(email: string) {
  if (!email) {
    return "Email is required.";
  } else if (!email.includes("@")) {
    return "Please enter a valid email address.";
  }
}

export function validatePassword(password: string) {
  if (!password) {
    return "Password is required.";
  } else if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
}

export async function login(email: string, password: string) {
  let user = await db.account.findUnique({
    where: { email: email },
    include: { Password: true },
  });

  if (!user || !user.Password) {
    throw new Error("Account not found!");
  }

  let hash = crypto
    .pbkdf2Sync(password, user.Password.salt, 1000, 64, "sha256")
    .toString("hex");

  if (hash !== user.Password.hash) {
    throw new Error("Invalid password");
  }

  return user;
}

export async function accountExists(email: string) {
  let account = await db.account.findUnique({
    where: { email: email },
    select: { id: true },
  });

  return Boolean(account);
}

export async function register(email: string, password: string) {
  const userExists = await accountExists(email);
  if (userExists) throw new Error("User already exists");

  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");

  return db.account.create({
    data: {
      email: email,
      Password: { create: { hash, salt } },
    },
  });
}
