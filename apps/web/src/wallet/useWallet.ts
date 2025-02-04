import { useWalletStore } from "@/hooks/stores/wallet-store";
import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler";
import { fundPubkey, fundSigner, sac, server, account as smartWallet } from "@/lib/stellar-smart-wallet";
import { api } from "@/trpc/react";
import { XLM_SAC } from "@freelii/utils/constants";
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
    });



    const { mutateAsync: createWallet } = api.wallet.create.useMutation({
        onError: ClientTRPCErrorHandler,
        onSuccess: (data) => {
            console.log('Wallet created:', data);
            toast.success('Wallet created successfully');
            void trpcUtils.wallet.invalidate();
        }
    });

    useEffect(() => {
        void connect();
    }, []);

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
                contractId: cid,
                signedTx,
                keyIdBase64
            } = result;

            await server.send(signedTx);
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
            await server.send(signedTx);
        } catch (error) {
            console.error('Transfer error:', {
                message: (error as Error).message,
                code: (error as { response?: { status: number } }).response?.status,
                details: (error as { response?: { data: { extras: string } } }).response?.data?.extras,
                raw: error
            });

            // Extract meaningful error message
            let errorMessage = "Transaction failed: ";
            if ((error as { error?: string }).error?.includes("InvalidAction")) {
                errorMessage += 'Invalid action'
            } else if ((error as { message?: string }).message) {
                errorMessage += (error as { message?: string }).message;
            } else {
                errorMessage += "Unknown error occurred";
            }

            toast.error(errorMessage);
        }

        void trpcUtils.wallet.getAccount.invalidate();
    }

    const fundWallet = async (id?: string | null): Promise<void> => {
        if (!id) return;
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

            await server.send(built!);
        } catch (error) {
            console.error(error);
            toast.error((error as Error)?.message ?? "Unknown error");
        } finally {
            setIsFunding(false);
        }
    }

    const connect = async () => {
        if (!!account?.keyId) {
            await smartWallet.connectWallet({ keyId: account?.keyId });
        }
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