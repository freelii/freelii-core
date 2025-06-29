"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner } from "@freelii/ui"
import { fromStroops, toStroops } from "@freelii/utils/functions"
import { ArrowUpRight, RefreshCw, X } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface WalletTransferModalProps {
    isOpen: boolean
    onClose: () => void
}

export function WalletTransferModal({ isOpen, onClose }: WalletTransferModalProps) {
    const { wallets, selectedWalletId, setSelectedWalletId } = useWalletStore()
    const { transfer, isLoadingAccount } = useWallet()

    const [sourceWalletId, setSourceWalletId] = useState<string>(selectedWalletId || "")
    const [destinationWalletId, setDestinationWalletId] = useState<string>("")
    const [amount, setAmount] = useState<string>("")
    const [isTransferring, setIsTransferring] = useState(false)

    const sourceWallet = wallets.find(w => w.id === sourceWalletId)
    const destinationWallet = wallets.find(w => w.id === destinationWalletId)

    const availableBalance = Number(sourceWallet?.main_balance?.amount || 0)
    const maxTransferAmount = Math.max(0, availableBalance - 1000000) // Reserve 0.1 XLM for fees

    const handleTransfer = async () => {
        if (!sourceWallet || !destinationWallet || !amount) {
            toast.error("Please fill in all fields")
            return
        }

        if (sourceWalletId === destinationWalletId) {
            toast.error("Cannot transfer to the same wallet")
            return
        }

        const transferAmount = parseFloat(amount)
        if (transferAmount <= 0) {
            toast.error("Amount must be greater than 0")
            return
        }

        if (Number(toStroops(transferAmount)) > maxTransferAmount) {
            toast.error(`Insufficient balance. Maximum available: ${fromStroops(maxTransferAmount, 4)} XLM`)
            return
        }

        setIsTransferring(true)

        try {
            // Set the source wallet as active for the transfer
            setSelectedWalletId(sourceWalletId)

            // Wait a moment for the wallet to be set properly
            await new Promise(resolve => setTimeout(resolve, 100))

            const result = await transfer({
                to: destinationWallet.address!,
                amount: toStroops(transferAmount)
            })

            if (result) {
                toast.success(`Successfully transferred ${amount} XLM to ${destinationWallet.alias}`)
                setAmount("")
                onClose()
            }
        } catch (error) {
            console.error("Transfer failed:", error)
            toast.error("Transfer failed. Please try again.")
        } finally {
            setIsTransferring(false)
        }
    }

    const handleMaxAmount = () => {
        if (maxTransferAmount > 0) {
            setAmount(fromStroops(maxTransferAmount, 4))
        }
    }

    const handleSwitchWallets = () => {
        if (sourceWalletId && destinationWalletId) {
            const tempSource = sourceWalletId
            setSourceWalletId(destinationWalletId)
            setDestinationWalletId(tempSource)
            // Clear amount when switching to recalculate with new source wallet balance
            setAmount("")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Transfer Funds</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Wallet Selection */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                            <select
                                value={sourceWalletId}
                                onChange={(e) => setSourceWalletId(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select source wallet</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {wallet.alias} - {fromStroops(Number(wallet.main_balance?.amount || 0), 2)} XLM
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Switch Button - Inline */}
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleSwitchWallets}
                                disabled={!sourceWalletId || !destinationWalletId || isTransferring}
                                className="group w-8 h-8 bg-primary/10 hover:bg-primary/20 disabled:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                                title="Switch wallets"
                            >
                                <RefreshCw className="h-3 w-3 text-primary group-hover:text-primary/80 group-disabled:text-gray-400 group-hover:rotate-180 transition-all duration-300" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                            <select
                                value={destinationWalletId}
                                onChange={(e) => setDestinationWalletId(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select destination wallet</option>
                                {wallets
                                    .filter(wallet => wallet.id !== sourceWalletId)
                                    .map((wallet) => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.alias} - {fromStroops(wallet.main_balance?.amount || 0, 2)} XLM
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.0001"
                                min="0"
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                            />
                            <button
                                type="button"
                                onClick={handleMaxAmount}
                                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
                                disabled={!sourceWalletId || maxTransferAmount <= 0}
                            >
                                MAX
                            </button>
                        </div>
                        {sourceWalletId && (
                            <p className="text-xs text-gray-500 mt-1">
                                Available: {fromStroops(maxTransferAmount, 2)} XLM
                            </p>
                        )}
                    </div>

                    {/* Transfer Summary - Compact */}
                    {sourceWallet && destinationWallet && amount && (
                        <div className="bg-gray-50 rounded-md p-3">
                            <div className="text-xs text-gray-600 text-center">
                                <span className="font-medium">{amount} XLM</span> from{' '}
                                <span className="font-medium">{sourceWallet.alias}</span> to{' '}
                                <span className="font-medium">{destinationWallet.alias}</span>
                                <div className="text-gray-500 mt-1">Network fee: ~0.001 XLM</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 p-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 text-sm py-2"
                        disabled={isTransferring}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        className="flex-1 text-sm py-2"
                        disabled={
                            !sourceWalletId ||
                            !destinationWalletId ||
                            !amount ||
                            isTransferring ||
                            isLoadingAccount ||
                            parseFloat(amount || "0") <= 0
                        }
                    >
                        {isTransferring ? (
                            <>
                                <LoadingSpinner className="h-3 w-3 mr-1" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Transfer
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 