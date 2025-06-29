# Network Switching Guide

This guide explains how to use the network switching functionality in the Freelii Core application.

## Overview

The application now supports dynamic switching between Stellar Testnet and Mainnet without requiring environment variable changes or application restarts. This is implemented using a React Context that manages network configuration.

## Architecture

### Key Components

1. **StellarContext** (`src/contexts/stellar-context.tsx`)
   - Manages the current network state
   - Provides network-specific configurations
   - Persists network preference in localStorage

2. **Network Configuration**
   - Supports both testnet and mainnet configurations
   - Uses network-specific environment variables
   - Falls back to existing single-network variables for backward compatibility

3. **Stellar Clients Factory** (`src/lib/stellar-smart-wallet-context.ts`)
   - Creates PasskeyKit, PasskeyServer, and other Stellar clients based on network config
   - Maintains backward compatibility with existing exports

4. **Custom Hooks** (`src/hooks/use-stellar-clients.ts`)
   - Provides easy access to network-aware Stellar clients
   - Automatically updates when network changes

5. **Network Switcher Component** (`src/components/network-switcher.tsx`)
   - UI component for switching between networks
   - Shows current network state with visual indicators

## Environment Variables

### New Network-Specific Variables

For each network (testnet/mainnet), you can now configure:

```bash
# Testnet
NEXT_PUBLIC_TESTNET_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_TESTNET_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_TESTNET_WALLET_WASM_HASH="your_testnet_wallet_wasm_hash"
NEXT_PUBLIC_TESTNET_ZAFEGARD_WASM_HASH="your_testnet_zafegard_wasm_hash"
NEXT_PUBLIC_TESTNET_LAUNCHTUBE_URL="https://testnet.launchtube.xyz"
NEXT_PUBLIC_TESTNET_LAUNCHTUBE_JWT="your_testnet_jwt"
NEXT_PUBLIC_TESTNET_MERCURY_URL="https://api.mercurydata.app"
NEXT_PUBLIC_TESTNET_MERCURY_JWT="your_testnet_mercury_jwt"
NEXT_PUBLIC_TESTNET_MERCURY_PROJECT_NAME="your_testnet_project"
NEXT_PUBLIC_TESTNET_MAIN_BALANCE_CONTRACT_ID="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
NEXT_PUBLIC_TESTNET_HORIZON_URL="https://horizon-testnet.stellar.org"

# Mainnet
NEXT_PUBLIC_MAINNET_RPC_URL="https://mainnet.sorobanrpc.com"
NEXT_PUBLIC_MAINNET_NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
NEXT_PUBLIC_MAINNET_WALLET_WASM_HASH="your_mainnet_wallet_wasm_hash"
NEXT_PUBLIC_MAINNET_ZAFEGARD_WASM_HASH="your_mainnet_zafegard_wasm_hash"
NEXT_PUBLIC_MAINNET_LAUNCHTUBE_URL="https://mainnet.launchtube.xyz"
NEXT_PUBLIC_MAINNET_LAUNCHTUBE_JWT="your_mainnet_jwt"
NEXT_PUBLIC_MAINNET_MERCURY_URL="https://api.mercurydata.app"
NEXT_PUBLIC_MAINNET_MERCURY_JWT="your_mainnet_mercury_jwt"
NEXT_PUBLIC_MAINNET_MERCURY_PROJECT_NAME="your_mainnet_project"
NEXT_PUBLIC_MAINNET_MAIN_BALANCE_CONTRACT_ID="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
NEXT_PUBLIC_MAINNET_HORIZON_URL="https://horizon.stellar.org"
```

### Backward Compatibility

The existing environment variables are still supported and will be used as fallbacks:

```bash
NEXT_PUBLIC_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_WALLET_WASM_HASH="your_wallet_wasm_hash"
# ... etc
```

## Usage

### 1. Setup the Context

The `StellarProvider` is already integrated into the app layout (`src/app/layout.tsx`):

```tsx
<StellarProvider>
  <TRPCReactProvider>
    {children}
  </TRPCReactProvider>
</StellarProvider>
```

### 2. Use Network-Aware Clients

Replace direct imports of Stellar clients with the context-aware hooks:

```tsx
// Before
import { account, server, rpc } from '@/lib/stellar-smart-wallet';

// After
import { useStellarClients } from '@/hooks/use-stellar-clients';

function MyComponent() {
  const { account, server, rpc, network } = useStellarClients();
  
  // These clients will automatically use the correct network configuration
}
```

### 3. Add Network Switcher

Include the network switcher component in your UI:

```tsx
import { NetworkSwitcher } from '@/components/network-switcher';

function MyPage() {
  return (
    <div>
      <NetworkSwitcher className="mb-4" />
      {/* Your other components */}
    </div>
  );
}
```

### 4. Access Network State

Use the context to access current network information:

```tsx
import { useStellar } from '@/contexts/stellar-context';

function MyComponent() {
  const { network, config, setNetwork } = useStellar();
  
  console.log('Current network:', network); // 'testnet' or 'mainnet'
  console.log('RPC URL:', config.rpcUrl);
  
  // Programmatically switch networks
  const switchToMainnet = () => setNetwork('mainnet');
}
```

## Migration Guide

### For Existing Components

1. **Replace direct client imports:**
   ```tsx
   // Old
   import { account } from '@/lib/stellar-smart-wallet';
   
   // New
   import { useStellarAccount } from '@/hooks/use-stellar-clients';
   const account = useStellarAccount();
   ```

2. **Update service methods to accept network config:**
   ```tsx
   // In services, accept config as parameter
   export class StellarService {
     constructor(private config: StellarNetworkConfig) {}
     
     // Use config.rpcUrl, config.networkPassphrase, etc.
   }
   ```

3. **Update server-side code:**
   - Server-side code should continue using environment variables
   - Consider creating separate service instances for different networks if needed

### For Server Components

Server components can't use the React context. For server-side network switching, you'll need to:

1. Use middleware to detect network preference from cookies/headers
2. Pass network information through props or server actions
3. Create server-side network factories similar to the client-side approach

## Best Practices

1. **Default Network**: The app defaults to testnet for safety
2. **Persistence**: Network preference is saved in localStorage
3. **Error Handling**: Always handle network switching gracefully
4. **Testing**: Test all functionality on both networks
5. **Environment**: Use different WASM hashes for testnet vs mainnet contracts

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all network-specific variables are set
2. **WASM Hash Mismatch**: Use correct contract hashes for each network
3. **JWT Tokens**: Ensure separate tokens for testnet/mainnet services
4. **CORS Issues**: Verify RPC URLs are accessible from your domain

### Debugging

1. **Check Network State**: Use browser dev tools to inspect localStorage
2. **Verify Config**: Console.log the current config object
3. **Test Network Switch**: Verify clients update after network change
4. **Check Environment**: Ensure all required env vars are loaded

## Example Implementation

See the `NetworkSwitcher` component and `useStellarClients` hook for complete implementation examples.