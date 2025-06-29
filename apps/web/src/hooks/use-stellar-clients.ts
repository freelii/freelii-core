'use client';

import { useStellar } from '@/contexts/stellar-context';
import { createStellarClients } from '@/lib/stellar-smart-wallet-context';
import { useMemo } from 'react';

export const useStellarClients = () => {
  const { config, network } = useStellar();

  const clients = useMemo(() => {
    return createStellarClients(config);
  }, [config]);

  return {
    ...clients,
    network,
    config,
  };
};

// Convenience hooks for individual clients
export const useStellarRpc = () => {
  const { rpc } = useStellarClients();
  return rpc;
};

export const useStellarAccount = () => {
  const { account } = useStellarClients();
  return account;
};

export const useStellarServer = () => {
  const { server } = useStellarClients();
  return server;
};
