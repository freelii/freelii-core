import { Asset } from "@stellar/stellar-sdk/minimal";

export function getAsset(sac: string): Asset {
    console.log('getAsset.sac', sac);
    if (sac === "XLM") return Asset.native();
    const address = sacToAddress(sac);
    console.log('getAsset.address', address);
    if (address === "native") return Asset.native();
    const [code, issuer] = address.split('-') as [string, string];
    if (!code || !issuer) {
        throw new Error(`Invalid SAC format ${address}`);
    }
    return new Asset(code, issuer);
}

export function sacToAddress(sac: string): string {
    switch (sac) {
        case "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75": // USDC Mainnet
            return "USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
        case "XLM":
        case "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC":
        case "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA":
        default:
            return "native";
    }
}

export function addressToSac(address: string): string {
    switch (address) {
        case "XLM":
        case "native":
            return "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
        case "USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN": // USDC Mainnet
            return "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
        default:
            return address;
    }
}