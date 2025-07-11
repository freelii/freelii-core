import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLERK_SECRET_KEY: z.string(),
    CLERK_PUBLISHABLE_KEY: z.string(),
    COINS_SECRET_KEY: z.string(),
    COINS_API_KEY: z.string(),
    COINS_API_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    WEBHOOK_SECRET: z.string(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    AUTH_SECRET: z.string(),
    COINS_PH_API_HOST: z.string(),
    COINS_PH_API_KEY: z.string(),
    COINS_PH_API_SECRET: z.string(),
    COINS_PH_PROXY_API_HOST: z.string(),
    COINS_PH_PROXY_API_KEY: z.string(),
    COINS_PH_PROXY_API_SECRET: z.string(),
    USE_COINS_PH_PROXY: z.string(),
    OPENAI_API_KEY: z.string(),
    RESEND_API_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
  */
  client: {
    NEXT_PUBLIC_APP_URL: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    // Network-specific variables (testnet/mainnet)
    NEXT_PUBLIC_TESTNET_RPC_URL: z.string(),
    NEXT_PUBLIC_TESTNET_LAUNCHTUBE_URL: z.string(),
    NEXT_PUBLIC_TESTNET_LAUNCHTUBE_JWT: z.string(),
    NEXT_PUBLIC_TESTNET_NETWORK_PASSPHRASE: z.string(),
    NEXT_PUBLIC_TESTNET_WALLET_WASM_HASH: z.string(),
    NEXT_PUBLIC_TESTNET_MERCURY_PROJECT_NAME: z.string(),
    NEXT_PUBLIC_TESTNET_MERCURY_URL: z.string(),
    NEXT_PUBLIC_TESTNET_MERCURY_JWT: z.string(),
    NEXT_PUBLIC_TESTNET_MAIN_BALANCE_CONTRACT_ID: z.string(),
    NEXT_PUBLIC_TESTNET_HORIZON_URL: z.string(),
    // Mainnet-specific variables
    NEXT_PUBLIC_MAINNET_RPC_URL: z.string(),
    NEXT_PUBLIC_MAINNET_LAUNCHTUBE_URL: z.string(),
    NEXT_PUBLIC_MAINNET_LAUNCHTUBE_JWT: z.string(),
    NEXT_PUBLIC_MAINNET_NETWORK_PASSPHRASE: z.string(),
    NEXT_PUBLIC_MAINNET_WALLET_WASM_HASH: z.string(),
    NEXT_PUBLIC_MAINNET_MERCURY_PROJECT_NAME: z.string(),
    NEXT_PUBLIC_MAINNET_MERCURY_URL: z.string(),
    NEXT_PUBLIC_MAINNET_MERCURY_JWT: z.string(),
    NEXT_PUBLIC_MAINNET_MAIN_BALANCE_CONTRACT_ID: z.string(),
    NEXT_PUBLIC_MAINNET_HORIZON_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    COINS_SECRET_KEY: process.env.COINS_SECRET_KEY,
    COINS_API_KEY: process.env.COINS_API_KEY,
    COINS_API_URL: process.env.COINS_API_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // Testnet environment variables
    NEXT_PUBLIC_TESTNET_RPC_URL: process.env.NEXT_PUBLIC_TESTNET_RPC_URL,
    NEXT_PUBLIC_TESTNET_LAUNCHTUBE_URL: process.env.NEXT_PUBLIC_TESTNET_LAUNCHTUBE_URL,
    NEXT_PUBLIC_TESTNET_LAUNCHTUBE_JWT: process.env.NEXT_PUBLIC_TESTNET_LAUNCHTUBE_JWT,
    NEXT_PUBLIC_TESTNET_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_TESTNET_NETWORK_PASSPHRASE,
    NEXT_PUBLIC_TESTNET_WALLET_WASM_HASH: process.env.NEXT_PUBLIC_TESTNET_WALLET_WASM_HASH,
    NEXT_PUBLIC_TESTNET_MERCURY_PROJECT_NAME: process.env.NEXT_PUBLIC_TESTNET_MERCURY_PROJECT_NAME,
    NEXT_PUBLIC_TESTNET_MERCURY_URL: process.env.NEXT_PUBLIC_TESTNET_MERCURY_URL,
    NEXT_PUBLIC_TESTNET_MERCURY_JWT: process.env.NEXT_PUBLIC_TESTNET_MERCURY_JWT,
    NEXT_PUBLIC_TESTNET_MAIN_BALANCE_CONTRACT_ID: process.env.NEXT_PUBLIC_TESTNET_MAIN_BALANCE_CONTRACT_ID,
    NEXT_PUBLIC_TESTNET_HORIZON_URL: process.env.NEXT_PUBLIC_TESTNET_HORIZON_URL,
    // Mainnet environment variables
    NEXT_PUBLIC_MAINNET_RPC_URL: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
    NEXT_PUBLIC_MAINNET_LAUNCHTUBE_URL: process.env.NEXT_PUBLIC_MAINNET_LAUNCHTUBE_URL,
    NEXT_PUBLIC_MAINNET_LAUNCHTUBE_JWT: process.env.NEXT_PUBLIC_MAINNET_LAUNCHTUBE_JWT,
    NEXT_PUBLIC_MAINNET_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_MAINNET_NETWORK_PASSPHRASE,
    NEXT_PUBLIC_MAINNET_WALLET_WASM_HASH: process.env.NEXT_PUBLIC_MAINNET_WALLET_WASM_HASH,
    NEXT_PUBLIC_MAINNET_MERCURY_PROJECT_NAME: process.env.NEXT_PUBLIC_MAINNET_MERCURY_PROJECT_NAME,
    NEXT_PUBLIC_MAINNET_MERCURY_URL: process.env.NEXT_PUBLIC_MAINNET_MERCURY_URL,
    NEXT_PUBLIC_MAINNET_MERCURY_JWT: process.env.NEXT_PUBLIC_MAINNET_MERCURY_JWT,
    NEXT_PUBLIC_MAINNET_MAIN_BALANCE_CONTRACT_ID: process.env.NEXT_PUBLIC_MAINNET_MAIN_BALANCE_CONTRACT_ID,
    NEXT_PUBLIC_MAINNET_HORIZON_URL: process.env.NEXT_PUBLIC_MAINNET_HORIZON_URL,
    COINS_PH_API_HOST: process.env.COINS_PH_API_HOST,
    COINS_PH_API_KEY: process.env.COINS_PH_API_KEY,
    COINS_PH_API_SECRET: process.env.COINS_PH_API_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    COINS_PH_PROXY_API_HOST: process.env.COINS_PH_PROXY_API_HOST,
    COINS_PH_PROXY_API_KEY: process.env.COINS_PH_PROXY_API_KEY,
    COINS_PH_PROXY_API_SECRET: process.env.COINS_PH_PROXY_API_SECRET,
    USE_COINS_PH_PROXY: process.env.USE_COINS_PH_PROXY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
