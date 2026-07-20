import { Redis } from "@upstash/redis";
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

// Vercel's Upstash-for-Redis integration sets KV_REST_API_URL /
// KV_REST_API_TOKEN (not the UPSTASH_REDIS_REST_* names that
// Redis.fromEnv() looks for by default), so we read them explicitly.
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

function emailKey(email: string) {
  return `user:email:${email.trim().toLowerCase()}`;
}

function idKey(id: string) {
  return `user:id:${id}`;
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
  const user = await redis.get<StoredUser>(emailKey(email));
  return user ?? undefined;
}

export async function getUserById(id: string): Promise<StoredUser | undefined> {
  const email = await redis.get<string>(idKey(id));
  if (!email) return undefined;
  return getUserByEmail(email);
}

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<StoredUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normalizedEmail,
    passwordHash,
    plan: "free",
    createdAt: new Date().toISOString(),
  };

  await redis.set(emailKey(user.email), user);
  await redis.set(idKey(user.id), user.email);
  return user;
}

export async function verifyPassword(email: string, password: string): Promise<StoredUser | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

// Used by the Google provider: find an existing account by email, or create
// a passwordless one on first sign-in.
export async function findOrCreateGoogleUser(input: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<StoredUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) return existing;

  const user: StoredUser = {
    id: crypto.randomUUID(),
    firstName: input.firstName || "Google",
    lastName: input.lastName || "User",
    email: normalizedEmail,
    passwordHash: null,
    plan: "free",
    createdAt: new Date().toISOString(),
  };

  await redis.set(emailKey(user.email), user);
  await redis.set(idKey(user.id), user.email);
  return user;
}