// instrumentation.ts at your project root (or inside /src if you're using it)
export function register() {
    // Only run on server side
    if (typeof window === 'undefined') {
        import('@vercel/otel').then(({ registerOTel }) => {
            registerOTel({ serviceName: 'freelii-platform' })
        })
    }
}
