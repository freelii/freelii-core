import type { Wallet } from 'prisma/prisma-client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  isLoading: boolean
  wallets: Wallet[]
  selectedWalletId: string | null
  setSelectedWalletId: (id: string) => void
  setWallets: (wallets: Wallet[]) => void
  getSelectedWallet: () => Wallet | undefined
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      wallets: [],
      selectedWalletId: null,

      setSelectedWalletId: (id) => {
        set({ selectedWalletId: id })
      },

      setWallets: (wallets) => {
        set({ wallets })
        // If no wallet is selected, select the default one
        if (!get().selectedWalletId) {
          const defaultWallet = wallets.find(w => w.isDefault)
          if (defaultWallet) {
            get().setSelectedWalletId(defaultWallet.id)
          }
        }
      },

      getSelectedWallet: () => {
        const { wallets, selectedWalletId } = get()
        console.log('Selected wallet ID:', selectedWalletId, wallets);
        return wallets.find(w => w.id === selectedWalletId)
      },
    }),
    {
      name: 'wallet-storage',
      // Only persist these fields
      partialize: (state) => ({
        selectedWalletId: state.selectedWalletId
      }),
    }
  )
) 