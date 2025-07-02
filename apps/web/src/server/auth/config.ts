import { env } from "@/env";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Account, type DefaultSession, type NextAuthConfig } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

import { db } from "@/server/db";
import { EmailService } from "@/server/services/email/email.service";

// Custom adapter to work with Integer user IDs
function customPrismaAdapter(prisma: typeof db) {
  const baseAdapter = PrismaAdapter(prisma);
  
  return {
    ...baseAdapter,
    createVerificationToken: async ({ identifier, expires, token }) => {
      return await prisma.verificationToken.create({
        data: {
          identifier,
          token,
          expires,
        },
      });
    },
    useVerificationToken: async ({ identifier, token }) => {
      try {
        const verificationToken = await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });
        return verificationToken;
      } catch (error) {
        // If the token doesn't exist, return null
        return null;
      }
    },
  };
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession["user"];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
    providers: [
        {
            id: "email",
            type: "email" as const,
            name: "Email",
            server: "",
            from: "Freelii <jose@freelii.app>",
            async sendVerificationRequest({ identifier: email, url }: { identifier: string; url: string }) {
                const emailService = new EmailService({ db });
                
                await emailService.sendSignInLinkEmail({
                    to: email,
                    name: email.split('@')[0] || 'User',
                    signInLink: url,
                });
            },
        } as any,
        GoogleProvider({

            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },

            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            profile(profile: GoogleProfile) {
                return {
                    id: profile.sub,
                    email: profile?.email,
                    name: profile?.name,
                    avatar_url: profile?.picture,
                };
            },
        }),
        GithubProvider({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        }),
        /**
         * ...add more providers here.
         *
         * Most other providers require a bit more work than the Discord provider. For example, the
         * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
         * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
         *
         * @see https://next-auth.js.org/providers/github
         */
    ],
    adapter: customPrismaAdapter(db),
    callbacks: {
        async signIn({ account, profile }: { account: Account | null; profile?: object | undefined; }) {
            console.log("signIn", account, profile);
            const isAccount = account && profile
            if (isAccount && account.provider === "google") {
                // return profile.email_verified && profile.email.endsWith("@example.com")
                return true
            }
            return true // Do different verification for other providers that don't have `email_verified`
        },
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
    },
} satisfies NextAuthConfig;