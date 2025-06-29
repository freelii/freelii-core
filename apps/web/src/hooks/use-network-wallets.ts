'use client';

import { useMemo } from 'react';
import { useStellar } from '@/contexts/stellar-context';
import { api } from '@/trpc/react';

/**
 * Hook that provides wallets filtered by the current network
 * This automatically updates when the network changes
 */
export const useNetworkWallets = () => {
  const { network } = useStellar();
  const { data: allWallets, isLoading } = api.wallet.getAll.useQuery();

  // Filter wallets by current network environment
  const wallets = useMemo(() => {
    if (!allWallets) return [];
    return allWallets.filter(wallet => {
      // Use network_environment field for testnet/mainnet filtering
      const walletEnvironment = wallet.network_environment || 'testnet'; // Default to testnet for legacy wallets
      return walletEnvironment === network;
    });
  }, [allWallets, network]);

  // Get network-specific counts
  const counts = useMemo(() => {
    if (!allWallets) return { testnet: 0, mainnet: 0 };
    
    return {
      testnet: allWallets.filter(w => (w.network_environment || 'testnet') === 'testnet').length,
      mainnet: allWallets.filter(w => (w.network_environment || 'testnet') === 'mainnet').length,
    };
  }, [allWallets]);

  return {
    wallets,
    allWallets: allWallets || [],
    isLoading,
    network,
    counts,
    hasWalletsInCurrentNetwork: wallets.length > 0,
    hasWalletsInOtherNetwork: (network === 'testnet' ? counts.mainnet : counts.testnet) > 0,
  };
};

export default useNetworkWallets;