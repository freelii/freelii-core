export class CoinsPHService {

    private get apiHost(): string {
        if (!process.env.COINS_PH_API_HOST) {
            throw new Error('COINS_PH_API_HOST is not set');
        }
        return process.env.COINS_PH_API_HOST;
    }

    private get apiKey(): string {
        if (!process.env.COINS_PH_API_KEY) {
            throw new Error('COINS_PH_API_KEY is not set');
        }
        return process.env.COINS_PH_API_KEY;
    }

    private get apiSecret(): string {
        if (!process.env.COINS_PH_API_SECRET) {
            throw new Error('COINS_PH_API_SECRET is not set');
        }
        return process.env.COINS_PH_API_SECRET;
    }

    test() {
        console.log('Hello from CoinsPHService');
    }
}
