import { Asset } from "@stellar/stellar-sdk/minimal";

export function getSacBalance(sac: string): Asset {
    const [code, issuer] = sac.split('-') as [string, string];
    if (!code || !issuer) {
        throw new Error('Invalid SAC format');
    }
    return new Asset(code, issuer);
}