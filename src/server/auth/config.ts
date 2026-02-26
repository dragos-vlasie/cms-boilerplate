import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure providers, callbacks, etc.
 *
 * We keep it VERY simple: Credentials provider + JWT sessions.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          credentials?.email &&
          typeof credentials.email === "string"
            ? credentials.email
            : "";
        const password =
          credentials?.password &&
          typeof credentials.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        if (!process.env.ADMIN_PASSWORD) {
          throw new Error("ADMIN_PASSWORD is not set");
        }

        // Simple check: only accept the password from .env
        if (password !== process.env.ADMIN_PASSWORD) {
          return null;
        }

        // We don't need a DB user for this boilerplate – just return a user object.
        return {
          id: `admin-${email}`,
          email,
          name: email,
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        // token.sub is set to the user.id we returned in authorize()
        id: (token.sub!) ?? "admin",
      },
    }),
  },
} satisfies NextAuthConfig;
