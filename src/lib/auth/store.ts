import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Every account is on the free plan — SiteScout has no paid tiers.
export type Plan = "free";

export interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string | null; // null for Google-only accounts
  plan: Plan;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readAll(): StoredUser[] {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function writeAll(users: StoredUser[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function getUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return readAll().find((u) => u.email.toLowerCase() === normalized);
}

export function getUserById(id: string): StoredUser | undefined {
  return readAll().find((u) => u.id === id);
}

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<StoredUser> {
  const users = readAll();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);
  return user;
}

export async function verifyPassword(email: string, password: string): Promise<StoredUser | null> {
  const user = getUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

// Used by the Google provider: find an existing account by email, or create
// a passwordless one on first sign-in.
export function findOrCreateGoogleUser(input: {
  email: string;
  firstName: string;
  lastName: string;
}): StoredUser {
  const existing = getUserByEmail(input.email);
  if (existing) return existing;

  const users = readAll();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    firstName: input.firstName || "Google",
    lastName: input.lastName || "User",
    email: input.email.trim().toLowerCase(),
    passwordHash: null,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);
  return user;
}
