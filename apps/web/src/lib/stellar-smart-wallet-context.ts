import { env } from "@/env";
import { Account, Keypair, StrKey } from "@stellar/stellar-sdk/minimal";
import { basicNodeSigner } from "@stellar/stellar-sdk/minimal/contract";
import { Server } from "@stellar/stellar-sdk/minimal/rpc";
import { noop } from "@tanstack/react-table";
import { PasskeyKit, PasskeyServer, SACClient } from "passkey-kit";
import type { StellarNetworkConfig } from "@/contexts/stellar-context";

// Factory function to create Stellar clients based on network configuration
export const createStellarClients = (config: StellarNetworkConfig) => {
  const rpc = new Server(config.rpcUrl);

  const account = new PasskeyKit({
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
    walletWasmHash: config.walletWasmHash,
  });

  const server = new PasskeyServer({
    rpcUrl: config.rpcUrl,
    launchtubeUrl: config.launchtubeUrl,
    launchtubeJwt: config.launchtubeJwt,
    mercuryProjectName: config.mercuryProjectName,
    mercuryUrl: config.mercuryUrl,
    mercuryJwt: config.mercuryJwt,
  });

  const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32));
  const mockSource = new Account(mockPubkey, '0');

  const fundKeypair = async () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const nowData = new TextEncoder().encode(now.getTime().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', nowData);
    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer));
    const publicKey = keypair.publicKey();

    rpc.getAccount(publicKey)
      .catch(() => rpc.requestAirdrop(publicKey))
      .catch(noop);

    return keypair;
  };

  const getFundPubkey = async () => (await fundKeypair()).publicKey();
  const getFundSigner = async () => basicNodeSigner(await fundKeypair(), config.networkPassphrase);

  const sac = new SACClient({
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
  });

  const native = sac.getSACClient(config.nativeContractId);

  return {
    rpc,
    account,
    server,
    mockPubkey,
    mockSource,
    fundKeypair,
    getFundPubkey,
    getFundSigner,
    sac,
    native,
  };
};

// Note: No backward compatibility exports here anymore
// Use useStellarClients() hook or createStellarClients() factory function
// The old direct exports have been removed to fully embrace the new context-based approach