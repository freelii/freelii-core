import { Asset } from "@stellar/stellar-sdk/minimal";

export function getAsset(sac: string): Asset {
    console.log('sac', sac);
    if (sac === "XLM") return Asset.native();
    const [code, issuer] = sacToAddress(sac).split('-') as [string, string];
    if (!code || !issuer) {
        throw new Error(`Invalid SAC format ${sac}`);
    }
    return new Asset(code, issuer);
}

export function sacToAddress(sac: string): string {
    switch (sac) {
        case "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75":
            return "USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
        case "XLM":
        case "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC":
        default:
            return "native";
    }
}