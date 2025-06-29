import { useWalletStore } from "@/hooks/stores/wallet-store";
import { useNetworkWalletSync } from "@/hooks/use-network-wallet-sync";
import { useStellarClients } from "@/hooks/use-stellar-clients";
import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface SignedTx {
    txHash: string;
}

export function useWallet() {
    const [isFunding, setIsFunding] = useState(false);
    const { setSelectedWalletId, setWallets, selectedWalletId, clearSelection } = useWalletStore();
    const router = useRouter();
    const params = useParams();

    // Ensure wallet selection is cleared when switching networks
    useNetworkWalletSync();

    // Get network-aware Stellar clients
    const {
        account: smartWallet,
        server,
        getFundPubkey,
        getFundSigner,
        network,
        mainBalance,
        native
    } = useStellarClients();


    // tRPC procedures
    const trpcUtils = api.useUtils();
    const { data: allWallets } = api.wallet.getAll.useQuery();

    // Filter wallets by current network environment
    const wallets = useMemo(() => {
        if (!allWallets) return [];

        return allWallets.filter(wallet => {
            // Use network_environment field for testnet/mainnet filtering
            const walletEnvironment = wallet.network_environment || 'testnet'; // Default to testnet for legacy wallets
            return walletEnvironment === network;
        });
    }, [allWallets, network]);

    const { data: account, status: accountStatus, isLoading: isLoadingAccount } = api.wallet.getAccount.useQuery({ walletId: String(selectedWalletId) }, {
        enabled: !!selectedWalletId,
    });



    const { mutateAsync: createWallet } = api.wallet.create.useMutation({
        onError: ClientTRPCErrorHandler,
        onSuccess: () => {
            toast.success('Wallet created successfully');
            void trpcUtils.wallet.getAccount.invalidate();
        }
    });


    // Update store when wallets change (including network filtering)
    useEffect(() => {
        if (wallets) {
            setWallets(wallets);
            void connect();
        }
    }, [wallets, network]);

    // Clear selected wallet if it doesn't exist in current network
    useEffect(() => {
        if (selectedWalletId && allWallets) {
            // Check if the selected wallet exists in the current network's filtered wallets
            const selectedWalletExists = wallets.some(w => w.id === selectedWalletId);
            if (!selectedWalletExists) {
                clearSelection();
            }
        }
    }, [wallets, selectedWalletId, clearSelection, allWallets]);

    // Also clear selection when network changes if no wallets exist in new network
    useEffect(() => {
        if (selectedWalletId && allWallets && wallets.length === 0) {
            clearSelection();
        }
    }, [network, selectedWalletId, allWallets, wallets.length, clearSelection]);

    // Clear selection immediately when network changes (proactive clearing)
    const [lastNetwork, setLastNetwork] = useState(network);
    useEffect(() => {
        if (lastNetwork !== network) {
            if (selectedWalletId) {
                clearSelection();
            }
            setLastNetwork(network);
        }
    }, [network, lastNetwork, selectedWalletId, clearSelection]);

    // Redirect to wallet creation if no wallets available for current network
    useEffect(() => {
        // Only redirect if we have data loaded and no wallets exist
        if (allWallets && wallets.length === 0) {
            const slug = params?.slug as string;
            const currentPath = window.location.pathname;

            // Don't redirect if we're already on the add-wallet page
            if (slug && !currentPath.includes('/add-wallet')) {
                router.push(`/${slug}/add-wallet`);
            }
        }
    }, [allWallets, wallets.length, router, params?.slug]);

    const create = async (alias: string) => {
        try {
            const result = await smartWallet.createWallet("Freelii", alias);
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
                isDefault: wallets?.length === 0,
                network: network === "mainnet" ? "mainnet" : "testnet",
                address: cid,
                keyId: keyIdBase64,
            })
            setSelectedWalletId(walletRes.id);
            // await initZafeguardPolicy(cid, keyIdBase64);
            // await getWalletSigners(cid, keyIdBase64);
            return walletRes;
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


    async function transfer({ to, amount }: { to: string, amount: bigint }) {
        if (!account) {
            throw new Error('No account found');
        }
        const { address, key_id } = account;
        if (!address || !key_id) {
            throw new Error('No address or keyId found');
        }


        if (!smartWallet.wallet) await connect();
        const at = await mainBalance.transfer({
            from: address,
            to,
            amount: BigInt(amount),
        });


        const signedTx = await smartWallet.sign(at.built!, { keyId: key_id })

        try {
            const res = await server.send(signedTx) as SignedTx;
            void trpcUtils.wallet.getAccount.invalidate();
            return res;
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

    }

    const fundWallet = async (id?: string | null): Promise<void> => {
        if (!id) return;
        console.log('funding wallet', id);
        setIsFunding(true);
        try {
            const fundPubkey = await getFundPubkey();
            const fundSigner = await getFundSigner();

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
        if (account && account.key_id) {
            try {
                await smartWallet.connectWallet({ keyId: account.key_id });
            } catch (error) {
                console.error('Connect error:', error);
                toast.error((error as Error)?.message ?? "Unknown error");
            }
        }
    }



    return {
        create,
        account,
        transfer,
        isFunding,
        fundWallet,
        connect,
        isLoadingAccount: isLoadingAccount || accountStatus === 'pending'
    }
}