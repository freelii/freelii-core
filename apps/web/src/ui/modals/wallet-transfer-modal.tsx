"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner } from "@freelii/ui"
import { fromStroops, toStroops } from "@freelii/utils/functions"
import { ArrowLeft, ArrowUpRight, RefreshCw, X, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface WalletTransferModalProps {
    isOpen: boolean
    onClose: () => void
}

export function WalletTransferModal({ isOpen, onClose }: WalletTransferModalProps) {
    const { wallets, selectedWalletId, setSelectedWalletId } = useWalletStore()
    const { transfer, isLoadingAccount, initPolicy, addAuthorizedWallet, isPolicyLoading, checkPolicyStatus } = useWallet()

    const [sourceWalletId, setSourceWalletId] = useState<string>(selectedWalletId || "")
    const [destinationWalletId, setDestinationWalletId] = useState<string>("")
    const [amount, setAmount] = useState<string>("")
    const [isTransferring, setIsTransferring] = useState(false)
    const [enableImmediateTransfers, setEnableImmediateTransfers] = useState(false)
    const [showPolicyStep, setShowPolicyStep] = useState(false)
    const [policyAccepted, setPolicyAccepted] = useState(false)
    const [risksAccepted, setRisksAccepted] = useState(false)
    const [isInitializingPolicy, setIsInitializingPolicy] = useState(false)

    const sourceWallet = wallets.find(w => w.id === sourceWalletId)
    const destinationWallet = wallets.find(w => w.id === destinationWalletId)

    const availableBalance = Number(sourceWallet?.main_balance?.amount || 0)
    const maxTransferAmount = Math.max(0, availableBalance)

    const handleProceedToPolicy = () => {
        if (enableImmediateTransfers) {
            setShowPolicyStep(true)
        } else {
            handleTransfer()
        }
    }

    const handleBackToTransfer = () => {
        setShowPolicyStep(false)
        setPolicyAccepted(false)
        setRisksAccepted(false)
    }

    const handleInitializePolicyAndTransfer = async () => {
        if (!policyAccepted || !risksAccepted) {
            toast.error("Please accept the policy terms to continue")
            return
        }

        setIsInitializingPolicy(true)
        try {

            // Initialize the policy first
            console.log("Initializing policy")
            await initPolicy()
            console.log("Policy initialized")

            // Add the destination wallet as authorized
            if (destinationWallet?.address) {
                await addAuthorizedWallet(destinationWallet.address)
            }

            // Now proceed with the transfer
            await handleTransfer()
        } catch (error) {
            console.error("Policy initialization failed:", error)
            toast.error("Failed to set up immediate transfers. Please try again.")
        } finally {
            setIsInitializingPolicy(false)
        }
    }

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
            toast.error(`Insufficient balance. Maximum available: ${fromStroops(maxTransferAmount, 4)} USD`)
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
                const transferType = enableImmediateTransfers ? "immediate" : "standard"
                toast.success(`Successfully completed ${transferType} transfer of ${amount} USD to ${destinationWallet.alias}`)
                setAmount("")
                setEnableImmediateTransfers(false)
                setShowPolicyStep(false)
                setPolicyAccepted(false)
                setRisksAccepted(false)
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

    // Policy Step UI
    if (showPolicyStep) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleBackToTransfer}
                                className="p-2 hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-lg font-semibold">Enable Immediate Transfers</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-700 font-medium text-sm">Immediate Transfer Policy</span>
                            </div>
                            <p className="text-xs text-blue-600">
                                You're about to enable immediate transfers between your wallets without passkey confirmation.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[40vh] overflow-y-auto">
                            <div className="space-y-3 text-sm text-gray-600">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">What This Means</h3>
                                    <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside">
                                        <li>Transfers between your wallets will happen instantly</li>
                                        <li>No additional passkey confirmation will be required</li>
                                        <li>This policy applies only to wallet-to-wallet transfers</li>
                                        <li>External transfers will still require passkey confirmation</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Security Considerations</h3>
                                    <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside">
                                        <li>This reduces security for internal transfers</li>
                                        <li>Authorized wallets will be stored in smart contract</li>
                                        <li>You can disable this policy at any time</li>
                                        <li>Only applies to wallets you explicitly authorize</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Current Transfer</h3>
                                    <div className="bg-gray-50 rounded p-2">
                                        <p className="text-xs">
                                            <span className="font-medium">{amount} USD</span> from{' '}
                                            <span className="font-medium">{sourceWallet?.alias}</span> to{' '}
                                            <span className="font-medium">{destinationWallet?.alias}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={policyAccepted}
                                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">
                                    I understand the security implications and want to enable immediate transfers
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={risksAccepted}
                                    onChange={(e) => setRisksAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">
                                    I acknowledge this will reduce security for wallet-to-wallet transfers
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 p-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={handleBackToTransfer}
                            className="flex-1 text-sm py-2"
                            disabled={isInitializingPolicy || isTransferring}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleInitializePolicyAndTransfer}
                            className="flex-1 text-sm py-2"
                            disabled={!policyAccepted || !risksAccepted || isInitializingPolicy || isTransferring}
                        >
                            {isInitializingPolicy || isTransferring ? (
                                <>
                                    <LoadingSpinner className="h-3 w-3 mr-1" />
                                    {isInitializingPolicy ? "Setting up..." : "Transferring..."}
                                </>
                            ) : (
                                <>
                                    <Zap className="h-3 w-3 mr-1" />
                                    Enable & Transfer
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Main Transfer Form
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
                                        {wallet.alias} - {fromStroops(Number(wallet.main_balance?.amount || 0), 2)} USD
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
                                            {wallet.alias} - {fromStroops(wallet.main_balance?.amount || 0, 2)} USD
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
                                Available: {fromStroops(maxTransferAmount, 2)} USD
                            </p>
                        )}
                    </div>

                    {/* Transfer Summary - Compact */}
                    {sourceWallet && destinationWallet && amount && (
                        <div className="bg-gray-50 rounded-md p-3">
                            <div className="text-xs text-gray-600 text-center">
                                <span className="font-medium">{amount} USD</span> from{' '}
                                <span className="font-medium">{sourceWallet.alias}</span> to{' '}
                                <span className="font-medium">{destinationWallet.alias}</span>
                            </div>
                        </div>
                    )}

                    {/* Immediate Transfer Option */}
                    {sourceWallet && destinationWallet && (
                        <div className="border border-gray-200 rounded-lg p-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enableImmediateTransfers}
                                    onChange={(e) => setEnableImmediateTransfers(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">Enable immediate transfers</span>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Skip passkey confirmation for future transfers between these wallets
                                    </p>
                                </div>
                            </label>
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
                        onClick={handleProceedToPolicy}
                        className="flex-1 text-sm py-2"
                        disabled={
                            !sourceWalletId ||
                            !destinationWalletId ||
                            !amount ||
                            isTransferring ||
                            isLoadingAccount ||
                            isPolicyLoading ||
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
                                {enableImmediateTransfers ? <Zap className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                                {enableImmediateTransfers ? "Setup & Transfer" : "Transfer"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 