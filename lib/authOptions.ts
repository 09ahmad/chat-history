import { client } from "@/db/src/index";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl + "/";
    },
    async signIn({ user }) {
      if (!user.email) return false;
      const existingUser = await client.user.findUnique({
        where: { email: user.email },
      });
      if (!existingUser) {
        await client.user.create({
          data: {
            email: user.email,
            name: user.name || "",
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await client.user.findUnique({
          where: { email: user.email },
        });
        user.token = dbUser?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
