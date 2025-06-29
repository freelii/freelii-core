// DEPRECATED: This file is no longer functional due to network context migration
// 
// MIGRATION REQUIRED:
// 
// Old usage:
// import { account, server, rpc, sac } from '@/lib/stellar-smart-wallet';
// 
// New usage in React components:
// import { useStellarClients } from '@/hooks/use-stellar-clients';
// const { account, server, rpc, sac } = useStellarClients();
// 
// New usage in non-React code:
// import { createStellarClients } from '@/lib/stellar-smart-wallet-context';
// import { useStellar } from '@/contexts/stellar-context';
// const clients = createStellarClients(config);

throw new Error(`
❌ MIGRATION REQUIRED: stellar-smart-wallet.ts is deprecated

The direct exports from this file are no longer available due to the network context migration.

To fix this error, update your imports:

1. For React components/hooks:
   OLD: import { account, server, rpc } from '@/lib/stellar-smart-wallet';
   NEW: 
   import { useStellarClients } from '@/hooks/use-stellar-clients';
   const { account, server, rpc } = useStellarClients();

2. For non-React code:
   Use createStellarClients() factory with network config.

Files that need updating:
- src/wallet/useWallet.ts
- Any other files importing from this module

See NETWORK_SWITCHING.md for complete migration guide.
`);