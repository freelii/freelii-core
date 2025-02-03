import { env } from "@/env";
import { useWalletStore } from "@/hooks/stores/wallet-store";
import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler";
import { fundKeypair, fundPubkey, fundSigner, sac, server, account as smartWallet } from "@/lib/stellar-smart-wallet";
import { api } from "@/trpc/react";
import { XLM_SAC } from "@freelii/utils/constants";
import { Address, Operation, rpc as SorobanRpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export function useWallet() {
    const [isFunding, setIsFunding] = useState(false);
    const { setSelectedWalletId, setWallets, selectedWalletId } = useWalletStore();


    // tRPC procedures
    const trpcUtils = api.useUtils();
    const { data: wallets } = api.wallet.getAll.useQuery();
    const { data: account } = api.wallet.getAccount.useQuery({ walletId: String(selectedWalletId) }, {
        enabled: !!selectedWalletId,
        refetchIntervalInBackground: true,
        refetchInterval: 7000,
    });



    const { mutateAsync: createWallet } = api.wallet.create.useMutation({
        onError: ClientTRPCErrorHandler,
        onSuccess: (data) => {
            console.log('Wallet created:', data);
            toast.success('Wallet created successfully');
            trpcUtils.wallet.invalidate();
        }
    });

    useEffect(() => {
        console.log('wallets', wallets);
        if (wallets) {
            console.log('wallets', wallets);
            setWallets(wallets);
        }
    }, [wallets]);


    const create = async (alias: string) => {
        try {

            const result = await smartWallet.createWallet("Freelii", alias);
            console.log('Create wallet result:', result);

            const {
                keyId: kid,
                contractId: cid,
                signedTx,
                keyIdBase64
            } = result;

            const res = await server.send(signedTx);

            console.log(res, kid, cid);

            // setKeyId(keyIdBase64);
            // setContractId(cid);
            const walletRes = await createWallet({
                alias,
                isDefault: true,
                network: "testnet",
                address: cid,
                keyId: keyIdBase64,
            })
            setSelectedWalletId(walletRes.id);
            console.log('walletRes', walletRes);
            // await fundWallet(cid),
            //     await getWalletSigners(),
            //     console.log('initWallet done', cid);

        } catch (error) {
            console.error('Detailed error:', {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
                response: (error as { response: {} }).response // If it's an API error
            });
            toast.error((error as Error)?.message ?? "Unknown error");
        }
    }

    async function transfer({ to, amount, sacAddress }: { to: string, amount: number, sacAddress?: string }) {
        if (!account) {
            console.log('No account found', account);
            throw new Error('No account found');
        }
        const { address, keyId } = account;
        if (!address || !keyId) {
            throw new Error('No address or keyId found');
        }


        if (!smartWallet.wallet) await connect();
        const asset = sac.getSACClient(sacAddress ?? XLM_SAC);
        const at = await asset.transfer({
            from: address,
            to,
            amount: BigInt(amount),
        });

        console.log('at', at.options);
        console.log('keyId', keyId);

        const signedTx = await smartWallet.sign(at.built!, { keyId });

        try {
            const res = await server.send(signedTx);
            console.log(res);
        } catch (error: any) {
            console.error('Transfer error:', {
                message: error.message,
                code: error.response?.status,
                details: error.response?.data?.extras,
                raw: error
            });

            // Extract meaningful error message
            let errorMessage = "Transaction failed: ";
            if ((error?.error as string).includes("InvalidAction")) {
                errorMessage += 'Invalid action'
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += "Unknown error occurred";
            }

            toast.error(errorMessage);
        }

        trpcUtils.wallet.getAccount.invalidate();
    }

    async function initWallet(contractId_: string) {
        try {
            const rpc = new SorobanRpc.Server(env.NEXT_PUBLIC_RPC_URL);
            const source = await rpc.getAccount(fundPubkey);
            const transaction_before = new TransactionBuilder(source, {
                fee: "0",
                networkPassphrase: env.NEXT_PUBLIC_NETWORK_PASSPHRASE
            })
                .addOperation(
                    Operation.createCustomContract({
                        address: Address.fromString(fundPubkey),
                        wasmHash: Buffer.from(
                            env.NEXT_PUBLIC_WALLET_WASM_HASH,
                            "hex",
                        ),
                        salt: Address.fromString(contractId_).toBuffer(),
                    }),
                )
                .setTimeout(300)
                .build();

            const sim = await rpc.simulateTransaction(transaction_before);

            if (!SorobanRpc.Api.isSimulationSuccess(sim))
                throw new Error("Simulation failed");

            const transaction_after = TransactionBuilder.cloneFrom(
                transaction_before,
                {
                    fee: (Number(sim.minResourceFee) + 10_000_000).toString(),
                    sorobanData: sim.transactionData.build(),
                },
            ).build();

            const op = transaction_after
                .operations[0] as Operation.InvokeHostFunction;

            op.auth![0] = sim.result!.auth[0]!;

            transaction_after.sign(await fundKeypair);

            const res1 = await rpc._sendTransaction(transaction_after);

            if (res1.status !== "PENDING")
                return toast.error("Transaction send failed");

            await new Promise((resolve) => setTimeout(resolve, 6000));

            const res2 = await rpc.getTransaction(res1.hash);

            if (res2.status !== "SUCCESS") return toast.error("Transaction failed");

            console.log('res2', res2);

            // const _zafeguardPolicy = Address.contract(
            //     res2.returnValue!.address().contractId(),
            // ).toString();
            // console.log('zafeguardPolicy', _zafeguardPolicy);
            // setZafeguardPolicy(_zafeguardPolicy);
            // const _contract = new Client({
            //     rpcUrl: env.NEXT_PUBLIC_RPC_URL,
            //     contractId: _zafeguardPolicy!,
            //     networkPassphrase: env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
            // });
            // setContract(_contract);
            // console.log('contract: ', _contract);
            // const instance = await account.rpc.getContractData(
            //     _zafeguardPolicy!,
            //     xdr.ScVal.scvLedgerKeyContractInstance(),
            // );

            // console.log('instance:', instance);

            // const admin = instance.val
            //     .contractData()
            //     .val()
            //     .instance()
            //     .storage()
            //     ?.filter((item) => {
            //         if (scValToNative(item.key())?.[0] === "Admin") {
            //             return true;
            //         }
            //     });

            // if (admin?.length) return;

            // console.log('admin:', admin);
            // const at = await _contract.init({
            //     admin: contractId_,
            // });
            // console.log('at:', at);
            // await account.sign(at, { keyId });

            // const res = await server.send(at.built!);
            // console.log('Init response:', res);
        } catch (error) {
            console.error('Error initializing wallet:', error);
        }
    }

    const fundWallet = async (id: string): Promise<void> => {
        console.log('funding wallet', id);
        setIsFunding(true);
        try {
            const native = sac.getSACClient(XLM_SAC);
            const { built, ...transfer } = await native.transfer({
                to: id,
                from: fundPubkey,
                amount: BigInt(100 * 10_000_000),
            });

            await transfer.signAuthEntries({
                address: fundPubkey,
                signAuthEntry: fundSigner.signAuthEntry,
            });

            const res = await server.send(built!);

            console.log('wallet fund', res);

        } catch (error) {
            console.error(error);
            toast.error((error as Error)?.message ?? "Unknown error");
        } finally {
            setIsFunding(false);
        }
    }

    const connect = async () => {
        if (!account?.keyId) {
            throw new Error('No keyId found');
        }
        const res = await smartWallet.connectWallet({ keyId: account?.keyId });
        console.log('wallet', res);
    }

    return {
        create,
        account,
        transfer,
        isFunding,
        fundWallet,
        connect,
    }
}