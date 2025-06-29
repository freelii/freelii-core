'use client';

import { useStellar } from '@/contexts/stellar-context';
import { NetworkSwitcher } from './network-switcher';

export const NetworkStatus: React.FC = () => {
  const { network, config } = useStellar();

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Current Network</h3>
          <NetworkSwitcher />
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div><span className="font-medium">Network:</span> {network}</div>
          <div><span className="font-medium">RPC:</span> {config.rpcUrl}</div>
          <div><span className="font-medium">Passphrase:</span> {config.networkPassphrase}</div>
          <div><span className="font-medium">Native Contract:</span> {config.nativeContractId}</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;