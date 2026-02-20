import "server-only";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { SessionUser } from "@/types/auth";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

type UserStoreGlobal = {
  __ajantaUserStore?: Map<string, StoredUser>;
};

function getStore() {
  const globalStore = globalThis as UserStoreGlobal;
  if (!globalStore.__ajantaUserStore) {
    globalStore.__ajantaUserStore = new Map<string, StoredUser>();
  }
  return globalStore.__ajantaUserStore;
}

function sanitizeUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(name: string, email: string, password: string) {
  const store = getStore();
  const normalizedEmail = normalizeEmail(email);
  const existing = store.get(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  };

  store.set(normalizedEmail, user);
  return sanitizeUser(user);
}

export async function authenticateUser(email: string, password: string) {
  const store = getStore();
  const normalizedEmail = normalizeEmail(email);
  const user = store.get(normalizedEmail);
  if (!user) return null;

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return null;

  return sanitizeUser(user);
}

