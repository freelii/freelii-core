import { Asset } from "@stellar/stellar-sdk/minimal";

export function getAsset(sac: string): Asset {
    if (sac === "XLM") return Asset.native();
    const [code, issuer] = sac.split('-') as [string, string];
    if (!code || !issuer) {
        throw new Error('Invalid SAC format');
    }
    return new Asset(code, issuer);
}