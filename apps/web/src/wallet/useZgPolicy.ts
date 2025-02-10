
export function useZgPolicy() {
    // const [zafeguardPolicy, setZafeguardPolicy] = useState<string | null>(null);
    // const [contract, setContract] = useState<Client | null>(null);



    // async function initZafeguardPolicy(contractId_: string, keyId: string) {
    //     try {
    //         const rpc = new SorobanRpc.Server(env.NEXT_PUBLIC_RPC_URL);
    //         const source = await rpc.getAccount(fundPubkey);
    //         const transaction_before = new TransactionBuilder(source, {
    //             fee: "0",
    //             networkPassphrase: env.NEXT_PUBLIC_NETWORK_PASSPHRASE
    //         })
    //             .addOperation(
    //                 Operation.createCustomContract({
    //                     address: Address.fromString(fundPubkey),
    //                     wasmHash: Buffer.from(
    //                         env.NEXT_PUBLIC_ZAFEGARD_WASM_HASH,
    //                         "hex",
    //                     ),
    //                     salt: Address.fromString(contractId_).toBuffer(),
    //                 }),
    //             )
    //             .setTimeout(300)
    //             .build();

    //         const sim = await rpc.simulateTransaction(transaction_before);

    //         if (!SorobanRpc.Api.isSimulationSuccess(sim))
    //             throw new Error("Simulation failed");

    //         const transaction_after = TransactionBuilder.cloneFrom(
    //             transaction_before,
    //             {
    //                 fee: (Number(sim.minResourceFee) + 10_000_000).toString(),
    //                 sorobanData: sim.transactionData.build(),
    //             },
    //         ).build();

    //         const op = transaction_after
    //             .operations[0] as Operation.InvokeHostFunction;

    //         op.auth![0] = sim.result!.auth[0]!;

    //         transaction_after.sign(await fundKeypair());

    //         const res1 = await rpc._sendTransaction(transaction_after);

    //         if (res1.status !== "PENDING")
    //             return toast.error("Transaction send failed");

    //         await new Promise((resolve) => setTimeout(resolve, 6000));

    //         const res2 = await rpc.getTransaction(res1.hash);

    //         if (res2.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) return toast.error("Transaction failed");

    //         console.log('res2', res2);

    //         const _zafeguardPolicy = Address.contract(
    //             res2.returnValue!.address().contractId(),
    //         ).toString();
    //         console.log('zafeguardPolicy', _zafeguardPolicy);
    //         setZafeguardPolicy(_zafeguardPolicy);
    //         const _contract = new Client({
    //             rpcUrl: env.NEXT_PUBLIC_RPC_URL,
    //             contractId: _zafeguardPolicy,
    //             networkPassphrase: env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
    //         });
    //         setContract(_contract);
    //         console.log('contract: ', _contract);
    //         const instance = await account.rpc.getContractData(
    //             _zafeguardPolicy,
    //             xdr.ScVal.scvLedgerKeyContractInstance(),
    //         );

    //         console.log('instance:', instance);

    //         const admin = instance.val
    //             .contractData()
    //             .val()
    //             .instance()
    //             .storage()
    //             ?.filter((item) => {
    //                 const key = scValToNative(item.key()) as string[];
    //                 if (key?.[0] === "Admin") {
    //                     return true;
    //                 }
    //             });

    //         if (admin?.length) return;

    //         console.log('admin:', admin);
    //         const at = await _contract.init({
    //             admin: contractId_,
    //         });
    //         console.log('at:', at);
    //         const signed = await account.sign(at.built!, { keyId });

    //         // TODO: Review the type
    //         const res = await server.send(signed) as SorobanRpc.Api.SendTransactionResponse;
    //         console.log('Init response:', res);
    //     } catch (error) {
    //         console.error('Error initializing wallet:', error);
    //     }
    // }

    // return {
    //     initZafeguardPolicy,
    // }
}
