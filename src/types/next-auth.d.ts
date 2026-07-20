import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      plan?: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: string;
    firstName?: string;
    lastName?: string;
  }
}
