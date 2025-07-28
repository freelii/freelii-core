/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "flagcdn.com",
            },
            {
                protocol: "https",
                hostname: "b4slusdeu7.ufs.sh",
            },
        ],
    },
    pageExtensions: ['ts', 'tsx'],
    transpilePackages: [
        'freelii-passkey-kit',
        'passkey-factory-sdk',
        'passkey-kit-sdk',
        'sac-sdk',
    ],
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            // Set fallbacks for Node.js modules
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                worker_threads: false,
                child_process: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                util: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
            };
        }

        // Handle ESM/CommonJS compatibility issues
        config.resolve.extensionAlias = {
            '.js': ['.js', '.ts', '.tsx'],
            '.mjs': ['.mjs', '.ts', '.tsx'],
        };

        return config;
    },
};

export default config;
