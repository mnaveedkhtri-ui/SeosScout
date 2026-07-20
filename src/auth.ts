import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { findOrCreateGoogleUser, getUserByEmail, verifyPassword } from "@/lib/auth/store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await verifyPassword(email, password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials sign-in already validated the account in `authorize`.
      if (account?.provider === "google" && user.email) {
        const [firstName, ...rest] = (user.name ?? "Google User").split(" ");
        await findOrCreateGoogleUser({
          email: user.email,
          firstName,
          lastName: rest.join(" "),
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // On first sign-in, look up the plan so it's available on every request
      // without re-reading the store each time.
      const email = user?.email ?? token.email;
      if (email) {
        const stored = await getUserByEmail(email);
        if (stored) {
          token.plan = stored.plan;
          token.firstName = stored.firstName;
          token.lastName = stored.lastName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.plan = (token.plan as string) ?? "free";
        session.user.firstName = (token.firstName as string) ?? "";
        session.user.lastName = (token.lastName as string) ?? "";
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});