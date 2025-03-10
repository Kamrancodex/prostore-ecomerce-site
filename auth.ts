import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, //30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        if (user && user.password) {
          const isMatched = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatched) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      //set the userid from token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      //if there is an update set the user name
      if (trigger == "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role;
        //if no name
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          //update db to reflect the token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
    // authorized({ request, auth }: any) {
    //   //check for session cart cookie

    //   if (!request.cookies.get("sessionCartId")) {
    //     //generate new cart id cookie
    //     const sessionCartId = crypto.randomUUID();

    //     //clone the req header
    //     const newRequestHeader = new Headers(request.headers);
    //     //create new res and add new headers
    //     const response = NextResponse.next({
    //       request: {
    //         headers: newRequestHeader,
    //       },
    //     });
    //     //set newly gen session cartid in the res cookie
    //     response.cookies.set("sessionCartId", sessionCartId);
    //     return true;
    //   } else {
    //     return true;
    //   }
    // },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
