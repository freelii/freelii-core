import type { Wallet, WalletBalance } from 'prisma/prisma-client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  isLoading: boolean
  wallets: (Wallet & { main_balance?: WalletBalance | null })[]
  selectedWalletId: string | null
  setSelectedWalletId: (id: string) => void
  setWallets: (wallets: Wallet[]) => void
  clearSelection: () => void
  getSelectedWallet: () => (Wallet & { main_balance?: WalletBalance | null }) | undefined
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

      clearSelection: () => {
        set({ selectedWalletId: null })
      },

      setWallets: (wallets) => {
        set({ wallets })
        // Only set default wallet if no wallet is currently selected
        const { selectedWalletId } = get()
        if (!selectedWalletId) {
          const defaultWallet = wallets.find(w => w.is_default)
          if (defaultWallet) {
            get().setSelectedWalletId(defaultWallet.id)
          }
        }
      },

      getSelectedWallet: () => {
        const { wallets, selectedWalletId } = get()
        return wallets.find(w => w.id === selectedWalletId)
      },
    }),
    {
      name: 'wallet-storage',
      // Remove selectedWalletId from persistence
      partialize: (state) => ({}),
    }
  )
) 