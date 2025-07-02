import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  Spec as ContractSpec,
  MethodOptions
} from '@stellar/stellar-sdk/contract';
import { Buffer } from "buffer";
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

// Type definitions for external smart-wallet-interface types
export type SignerKey =
  | { tag: "Ed25519", values: readonly [Buffer] }
  | { tag: "Contract", values: readonly [string] };

export type Context = {
  tag: "Contract",
  values: readonly [{
    contract: string;
    fn_name: string;
    args: any[];
  }]
};


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCU7H7QGEU6V43WY22I3JFLP7NLQYF7OWZ5RQAYPYNR3IVPJTRI54JX2",
  }
} as const

export type StorageKey = { tag: "Admin", values: void } | { tag: "AuthorizedWallets", values: readonly [Buffer] } | { tag: "PolicySigners", values: void };

export const Errors = {
  1: { message: "AlreadyInitialized" },

  2: { message: "NotInitialized" },

  3: { message: "NotFound" },

  4: { message: "NotAllowed" },

  5: { message: "InvalidRecipient" },

  6: { message: "InvalidFunction" }
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the policy with an admin
   */
  init: ({ admin }: { admin: string }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a add_wallet_signer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Add a wallet signer with authorized recipient addresses
   */
  add_wallet_signer: ({ signer_pubkey, smart_wallet, authorized_recipients }: { signer_pubkey: Buffer, smart_wallet: string, authorized_recipients: Array<string> }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a remove_wallet_signer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Remove a wallet signer
   */
  remove_wallet_signer: ({ signer_pubkey, smart_wallet }: { signer_pubkey: Buffer, smart_wallet: string }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a update_wallet_signer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update authorized recipients for a signer
   */
  update_wallet_signer: ({ signer_pubkey, authorized_recipients }: { signer_pubkey: Buffer, authorized_recipients: Array<string> }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a add_policy_signer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Add a policy signer (can receive transfers from any authorized wallet signer)
   */
  add_policy_signer: ({ signer_address }: { signer_address: string }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a remove_policy_signer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Remove a policy signer
   */
  remove_policy_signer: ({ signer_address }: { signer_address: string }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_authorized_recipients transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get authorized recipients for a signer (view function)
   */
  get_authorized_recipients: ({ signer_pubkey }: { signer_pubkey: Buffer }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a get_policy_signers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all policy signers (view function)
   */
  get_policy_signers: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a policy__ transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Policy validation for wallet-to-wallet transfers
   */
  policy__: ({ _source, signer, contexts }: { _source: string, signer: SignerKey, contexts: Array<Context> }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec(["AAAAAgAAAAAAAAAAAAAAClN0b3JhZ2VLZXkAAAAAAAMAAAAAAAAAAAAAAAVBZG1pbgAAAAAAAAEAAAAAAAAAEUF1dGhvcml6ZWRXYWxsZXRzAAAAAAAAAQAAA+4AAAAgAAAAAAAAAAAAAAANUG9saWN5U2lnbmVycwAAAA==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAITm90Rm91bmQAAAADAAAAAAAAAApOb3RBbGxvd2VkAAAAAAAEAAAAAAAAABBJbnZhbGlkUmVjaXBpZW50AAAABQAAAAAAAAAPSW52YWxpZEZ1bmN0aW9uAAAAAAY=",
        "AAAAAAAAACNJbml0aWFsaXplIHRoZSBwb2xpY3kgd2l0aCBhbiBhZG1pbgAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAADdBZGQgYSB3YWxsZXQgc2lnbmVyIHdpdGggYXV0aG9yaXplZCByZWNpcGllbnQgYWRkcmVzc2VzAAAAABFhZGRfd2FsbGV0X3NpZ25lcgAAAAAAAAMAAAAAAAAADXNpZ25lcl9wdWJrZXkAAAAAAAPuAAAAIAAAAAAAAAAMc21hcnRfd2FsbGV0AAAAEwAAAAAAAAAVYXV0aG9yaXplZF9yZWNpcGllbnRzAAAAAAAD6gAAABMAAAAA",
        "AAAAAAAAABZSZW1vdmUgYSB3YWxsZXQgc2lnbmVyAAAAAAAUcmVtb3ZlX3dhbGxldF9zaWduZXIAAAACAAAAAAAAAA1zaWduZXJfcHVia2V5AAAAAAAD7gAAACAAAAAAAAAADHNtYXJ0X3dhbGxldAAAABMAAAAA",
        "AAAAAAAAAClVcGRhdGUgYXV0aG9yaXplZCByZWNpcGllbnRzIGZvciBhIHNpZ25lcgAAAAAAABR1cGRhdGVfd2FsbGV0X3NpZ25lcgAAAAIAAAAAAAAADXNpZ25lcl9wdWJrZXkAAAAAAAPuAAAAIAAAAAAAAAAVYXV0aG9yaXplZF9yZWNpcGllbnRzAAAAAAAD6gAAABMAAAAA",
        "AAAAAAAAAE1BZGQgYSBwb2xpY3kgc2lnbmVyIChjYW4gcmVjZWl2ZSB0cmFuc2ZlcnMgZnJvbSBhbnkgYXV0aG9yaXplZCB3YWxsZXQgc2lnbmVyKQAAAAAAABFhZGRfcG9saWN5X3NpZ25lcgAAAAAAAAEAAAAAAAAADnNpZ25lcl9hZGRyZXNzAAAAAAATAAAAAA==",
        "AAAAAAAAABZSZW1vdmUgYSBwb2xpY3kgc2lnbmVyAAAAAAAUcmVtb3ZlX3BvbGljeV9zaWduZXIAAAABAAAAAAAAAA5zaWduZXJfYWRkcmVzcwAAAAAAEwAAAAA=",
        "AAAAAAAAADZHZXQgYXV0aG9yaXplZCByZWNpcGllbnRzIGZvciBhIHNpZ25lciAodmlldyBmdW5jdGlvbikAAAAAABlnZXRfYXV0aG9yaXplZF9yZWNpcGllbnRzAAAAAAAAAQAAAAAAAAANc2lnbmVyX3B1YmtleQAAAAAAA+4AAAAgAAAAAQAAA+oAAAAT",
        "AAAAAAAAACZHZXQgYWxsIHBvbGljeSBzaWduZXJzICh2aWV3IGZ1bmN0aW9uKQAAAAAAEmdldF9wb2xpY3lfc2lnbmVycwAAAAAAAAAAAAEAAAPqAAAAEw==",
        "AAAAAAAAADBQb2xpY3kgdmFsaWRhdGlvbiBmb3Igd2FsbGV0LXRvLXdhbGxldCB0cmFuc2ZlcnMAAAAIcG9saWN5X18AAAADAAAAAAAAAAdfc291cmNlAAAAABMAAAAAAAAABnNpZ25lcgAAAAAH0AAAAAlTaWduZXJLZXkAAAAAAAAAAAAACGNvbnRleHRzAAAD6gAAB9AAAAAHQ29udGV4dAAAAAAA"]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
    add_wallet_signer: this.txFromJSON<null>,
    remove_wallet_signer: this.txFromJSON<null>,
    update_wallet_signer: this.txFromJSON<null>,
    add_policy_signer: this.txFromJSON<null>,
    remove_policy_signer: this.txFromJSON<null>,
    get_authorized_recipients: this.txFromJSON<Array<string>>,
    get_policy_signers: this.txFromJSON<Array<string>>,
    policy__: this.txFromJSON<null>
  }
}