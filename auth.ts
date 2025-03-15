import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
        token.id = user.id;
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
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });
            if (sessionCart) {
              //delte current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });
              //assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }
      //handle sesssion updates
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }
      return token;
    },
    authorized({ request, auth }: any) {
      // 1) Define the paths that require a logged-in user
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // 2) Check if the requested path is protected
      const { pathname } = request.nextUrl;
      const isProtected = protectedPaths.some((regex) => regex.test(pathname));

      // 3) If user is NOT logged in (auth == null) AND path is protected => block
      if (!auth && isProtected) {
        // Returning `false` => NextAuth auto-redirects to `pages.signIn` => /sign-in
        return false;
      }

      // 4) Set a sessionCartId if it doesn't exist (optional)
      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();

        // Build a NextResponse that sets the cart ID cookie
        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });
        response.cookies.set("sessionCartId", sessionCartId);

        // Return that response so NextAuth merges it into the request
        return response;
      }

      // 5) Otherwise, allow
      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
