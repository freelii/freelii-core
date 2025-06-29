'use client';

import { useNetworkWallets } from '@/hooks/use-network-wallets';
import { useStellar } from '@/contexts/stellar-context';

interface NetworkWalletInfoProps {
  className?: string;
}

export const NetworkWalletInfo: React.FC<NetworkWalletInfoProps> = ({ className }) => {
  const { network } = useStellar();
  const { wallets, counts, hasWalletsInCurrentNetwork, hasWalletsInOtherNetwork } = useNetworkWallets();

  return (
    <div className={className}>
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Current Network:</span>
          <span className={network === 'testnet' ? 'text-orange-600' : 'text-green-600'}>
            {network}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Wallets in {network}:</span>
          <span className="font-medium">{wallets.length}</span>
        </div>
        {hasWalletsInOtherNetwork && (
          <div className="flex justify-between text-gray-400">
            <span>Wallets in {network === 'testnet' ? 'mainnet' : 'testnet'}:</span>
            <span>{network === 'testnet' ? counts.mainnet : counts.testnet}</span>
          </div>
        )}
        {!hasWalletsInCurrentNetwork && hasWalletsInOtherNetwork && (
          <div className="text-xs text-amber-600 mt-2">
            💡 Switch networks to see your other wallets
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkWalletInfo;