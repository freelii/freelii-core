'use client';

import { useEffect, useRef } from 'react';
import { useStellar } from '@/contexts/stellar-context';
import { useWalletStore } from './stores/wallet-store';

/**
 * Hook that ensures wallet selection is cleared when switching networks
 * if the selected wallet doesn't exist in the new network
 */
export const useNetworkWalletSync = () => {
  const { network } = useStellar();
  const { selectedWalletId, clearSelection } = useWalletStore();
  const previousNetwork = useRef(network);

  useEffect(() => {
    // If network changed and there's a selected wallet
    if (previousNetwork.current !== network && selectedWalletId) {
      clearSelection();
    }
    
    // Update previous network
    previousNetwork.current = network;
  }, [network, selectedWalletId, clearSelection]);
};

export default useNetworkWalletSync;