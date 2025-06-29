'use client';

import { useStellar, type NetworkType } from '@/contexts/stellar-context';
import { Button } from '@freelii/ui';
import { cn } from '@freelii/utils';

interface NetworkSwitcherProps {
  className?: string;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ className }) => {
  const { network, setNetwork } = useStellar();

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm font-medium text-gray-700">Network:</span>
      <div className="flex rounded-md border border-gray-300 overflow-hidden">
        <Button
          variant={network === 'testnet' ? 'default' : 'outline'}
          onClick={() => handleNetworkChange('testnet')}
          className={cn(
            'rounded-none border-0 px-3 py-1 text-xs',
            network === 'testnet'
              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          Testnet
        </Button>
        <Button
          variant={network === 'mainnet' ? 'default' : 'outline'}
          onClick={() => handleNetworkChange('mainnet')}
          className={cn(
            'rounded-none border-0 px-3 py-1 text-xs',
            network === 'mainnet'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          Mainnet
        </Button>
      </div>
    </div>
  );
};

export default NetworkSwitcher;