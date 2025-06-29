'use client';

import { api } from '@/trpc/react';
import { useStellar } from '@/contexts/stellar-context';

export const WalletNetworkDebug: React.FC = () => {
  const { network } = useStellar();
  const { data: allWallets } = api.wallet.getAll.useQuery();

  if (!allWallets) return <div>Loading wallets...</div>;

  const walletsWithNullEnvironment = allWallets.filter(w => !w.network_environment);
  const testnetWallets = allWallets.filter(w => w.network_environment === 'testnet');
  const mainnetWallets = allWallets.filter(w => w.network_environment === 'mainnet');

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-3">Wallet Network Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Current Network:</strong> {network}</div>
        <div><strong>Total Wallets:</strong> {allWallets.length}</div>
        <div><strong>Testnet Wallets:</strong> {testnetWallets.length}</div>
        <div><strong>Mainnet Wallets:</strong> {mainnetWallets.length}</div>
        <div className="text-red-600">
          <strong>Wallets with NULL network_environment:</strong> {walletsWithNullEnvironment.length}
        </div>
      </div>

      {walletsWithNullEnvironment.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-red-600 mb-2">Wallets needing environment assignment:</h4>
          <div className="space-y-1 text-xs">
            {walletsWithNullEnvironment.map(wallet => (
              <div key={wallet.id} className="bg-white p-2 rounded border">
                <div><strong>Alias:</strong> {wallet.alias}</div>
                <div><strong>Address:</strong> {wallet.address}</div>
                <div><strong>Network:</strong> {wallet.network}</div>
                <div><strong>Environment:</strong> <span className="text-red-600">NULL</span></div>
                <div><strong>Created:</strong> {new Date(wallet.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="font-medium mb-2">All Wallets:</h4>
        <div className="space-y-1 text-xs">
          {allWallets.map(wallet => (
            <div key={wallet.id} className="bg-white p-2 rounded border">
              <div><strong>Alias:</strong> {wallet.alias}</div>
              <div><strong>Network:</strong> {wallet.network}</div>
              <div><strong>Environment:</strong> 
                <span className={wallet.network_environment ? 'text-green-600' : 'text-red-600'}>
                  {wallet.network_environment || 'NULL'}
                </span>
              </div>
              <div><strong>Address:</strong> {wallet.address}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletNetworkDebug;