"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner } from "@freelii/ui"
import { fromStroops, toStroops } from "@freelii/utils/functions"
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react"
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
                to: destinationWallet.address,
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Transfer Between Wallets</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Source Wallet */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Wallet
                        </label>
                        <select
                            value={sourceWalletId}
                            onChange={(e) => setSourceWalletId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Select source wallet</option>
                            {wallets.map((wallet) => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.alias} - {fromStroops(Number(wallet.main_balance?.amount || 0), 2)} XLM
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Transfer Direction Icon */}
                    <div className="flex justify-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <ArrowDownLeft className="h-4 w-4 text-primary" />
                        </div>
                    </div>

                    {/* Destination Wallet */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To Wallet
                        </label>
                        <select
                            value={destinationWalletId}
                            onChange={(e) => setDestinationWalletId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (XLM)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.0001"
                                min="0"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-16"
                            />
                            <button
                                type="button"
                                onClick={handleMaxAmount}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                                disabled={!sourceWalletId || maxTransferAmount <= 0}
                            >
                                MAX
                            </button>
                        </div>
                        {sourceWalletId && (
                            <p className="text-xs text-gray-500 mt-1">
                                Available: {fromStroops(maxTransferAmount, 4)} XLM
                                (0.1 XLM reserved for fees)
                            </p>
                        )}
                    </div>

                    {/* Transfer Summary */}
                    {sourceWallet && destinationWallet && amount && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <h3 className="text-sm font-medium text-gray-700">Transfer Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span>From:</span>
                                <span className="font-medium">{sourceWallet.alias}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>To:</span>
                                <span className="font-medium">{destinationWallet.alias}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Amount:</span>
                                <span className="font-medium">{amount} XLM</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Network Fee:</span>
                                <span>~0.001 XLM</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isTransferring}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        className="flex-1"
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
                                <LoadingSpinner className="h-4 w-4 mr-2" />
                                Transferring...
                            </>
                        ) : (
                            <>
                                <ArrowUpRight className="h-4 w-4 mr-2" />
                                Transfer
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 