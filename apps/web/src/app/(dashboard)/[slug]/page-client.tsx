"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { api } from "@/trpc/react"
import { type ITransactionDetails } from "@/ui/transactions-table/transaction-details"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner } from "@freelii/ui"
import { fromStroops } from "@freelii/utils/functions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  CreditCard,
  XCircle,
  Zap
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { WalletTransferModal } from "@/ui/modals/wallet-transfer-modal"

dayjs.extend(relativeTime)

const WalletBadge = ({ walletAlias, onClick }: { walletAlias?: string | null; onClick?: () => void }) => {
  if (!walletAlias) return null;

  return (
    <Button
      variant="ghost"
      className={`inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors hover:border-gray-300 transition-opacity duration-200 mr-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {walletAlias}
    </Button>
  );
};

const QuickActionButton = ({ icon, label, href, onClick }: { icon: JSX.Element, label: string, href?: string, onClick?: () => void }) => {
  if (href) {
    return (
      <Link href={href} className="block p-4 border border-gray-200 rounded-lg bg-white hover:border-primary/20 transition-all">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="block p-4 border border-gray-200 rounded-lg bg-white hover:border-primary/20 transition-all w-full text-left">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    </button>
  )
}

/**
 * Extract payment amount from Soroban transaction events
 * Looks for transfer events in the events array and extracts i128 amounts
 * Maps contract address to actual currency from wallet balances
 */
const extractSorobanPaymentAmount = (transaction: any): { amount: string; currency: string } => {
  let amount = "0";
  let currency = "XLM"; // Default fallback
  let contractAddress: string | undefined;

  try {
    console.log('🔍 DEBUG: Starting Soroban events extraction for transaction:', transaction.transaction_hash);
    console.log('🔍 DEBUG: Events count:', transaction.events?.length || 0);
    console.log('🔍 DEBUG: Operations count:', transaction.operations?.length || 0);

    // First, try to extract contract address from operations
    if (transaction.operations && Array.isArray(transaction.operations) && transaction.operations.length > 0) {
      for (const operation of transaction.operations) {
        if (operation.contract_address) {
          contractAddress = operation.contract_address;
          console.log('🔍 DEBUG: Found contract address from operation:', contractAddress);
          break;
        }
      }
    }

    // If no contract address from operations, try to extract from raw webhook data
    if (!contractAddress && transaction.raw_webhook_data) {
      const operations = transaction.raw_webhook_data?.data?.body?.tx?.tx?.operations;
      if (operations && Array.isArray(operations)) {
        for (const op of operations) {
          if (op.body?.invoke_host_function?.host_function?.invoke_contract?.contract_address) {
            contractAddress = op.body.invoke_host_function.host_function.invoke_contract.contract_address;
            console.log('🔍 DEBUG: Found contract address from webhook data:', contractAddress);
            break;
          }
        }
      }
    }

    // Look at the stored Soroban events (from database)
    const events = transaction.events;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return { amount, currency };
    }

    // Find transfer events and extract amount
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Check if this is a transfer event by looking at topics
      const topics = event.topics;
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        continue;
      }

      // Look for transfer symbol in first topic
      const firstTopic = topics[0];
      if (!firstTopic || firstTopic.symbol !== "transfer") {
        continue;
      }

      // Extract amount from data field
      const data = event.data;
      if (!data) {
        continue;
      }

      // Handle i128 format (Stellar's large number format)
      if (data.i128) {
        const hi = data.i128.hi || 0;
        const lo = data.i128.lo || 0;

        // For most normal amounts, hi will be 0 and lo contains the amount in stroops
        // Convert from stroops to asset units by dividing by 10,000,000
        const stroopsAmount = hi * Math.pow(2, 32) + lo; // Combine hi and lo parts
        const assetAmount = stroopsAmount / 10000000;

        amount = assetAmount.toString();
        break;
      }

      // Handle direct number format (fallback)
      else if (typeof data === 'number' && data > 0) {
        const assetAmount = data / 10000000;
        amount = assetAmount.toString();
        break;
      }

      // Handle other potential formats
      else if (typeof data === 'object' && data !== null) {
        // Look for common amount field names
        const amountFields = ['amount', 'value', 'balance'];
        for (const field of amountFields) {
          if (data[field] !== undefined) {
            const fieldValue = data[field];
            if (typeof fieldValue === 'number' && fieldValue > 0) {
              const assetAmount = fieldValue / 10000000;
              amount = assetAmount.toString();
              console.log(`🔍 DEBUG: Extracted amount from ${field}: ${fieldValue} stroops = ${assetAmount} units`);
              break;
            }
          }
        }
        if (amount !== "0") break;
      }
    }

    // Map contract address to currency using a simple lookup
    // In a real implementation, you'd query the database, but for UI we can do a simple mapping
    if (contractAddress) {
      console.log(`🔍 DEBUG: Looking up currency for contract address: ${contractAddress}`);
      // Map known contract addresses to currencies
      const contractToCurrency: Record<string, string> = {
        'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC': 'USDC', // Testnet main balance contract
        'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA': 'USDC', // Mainnet main balance contract
        // Add more mappings as needed
      };

      const mappedCurrency = contractToCurrency[contractAddress];
      if (mappedCurrency) {
        currency = mappedCurrency;
        console.log(`🔍 DEBUG: Mapped contract ${contractAddress} to currency: ${currency}`);
      } else {
        console.log(`🔍 DEBUG: Unknown contract address ${contractAddress}, using default currency: ${currency}`);
      }
    }

    console.log(`🔍 DEBUG: Final extracted amount: ${amount} ${currency} for transaction ${transaction.transaction_hash}`);

  } catch (error) {
    console.error('Error extracting Soroban payment amount from events:', error);
  }

  return { amount, currency };
};

const SorobanTransactionCard = ({ transaction }: { transaction: any }) => {
  const { account } = useWallet();

  const getTransactionType = () => {
    // Check operations for contract calls that indicate transaction type
    const operation = transaction.operations?.[0];
    if (operation?.function_name) {
      switch (operation.function_name) {
        case 'transfer':
          // Determine if this is outbound or inbound for the current user
          // Parse the events to get FROM/TO addresses
          const events = transaction.events || [];
          let isOutbound = false;
          let recipientAddress = '';

          for (const event of events) {
            if (event.topics?.[0]?.symbol === 'transfer') {
              // Transfer event structure: [transfer, from, to, asset]
              const fromAddr = event.topics?.[1]?.address;
              const toAddr = event.topics?.[2]?.address;

              if (fromAddr && toAddr) {
                // Check if current wallet's address matches the FROM address
                const currentWalletAddress = account?.address;
                if (currentWalletAddress === fromAddr) {
                  isOutbound = true;
                  recipientAddress = toAddr;
                }
                break;
              }
            }
          }

          if (isOutbound) {
            return { type: 'Money Sent', icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-red-600' };
          } else {
            return { type: 'Money Received', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-green-600' };
          }
        case 'swap':
          return { type: 'Currency Exchange', icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-purple-600' };
        case 'deposit':
          return { type: 'Automatic Savings', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-green-600' };
        case 'mint':
          return { type: 'Account Funding', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-green-600' };
        case 'burn':
          return { type: 'Account Withdrawal', icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-orange-600' };
        default:
          return { type: 'Banking Service', icon: <Zap className="h-4 w-4" />, color: 'text-yellow-600' };
      }
    }
    return { type: 'Banking Activity', icon: <ArrowRight className="h-4 w-4" />, color: 'text-gray-600' };
  };

  const { type, icon, color } = getTransactionType();

  const getStatusDisplay = () => {
    console.log('transaction:', transaction)
    if (transaction.is_successful) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: 'Completed',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      };
    } else {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: 'Failed',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700'
      };
    }
  };

  const status = getStatusDisplay();

  // Format fee in a more banking-friendly way
  const formatFee = (feeInStroops: number) => {
    const feeInXLM = feeInStroops / 10000000;
    if (feeInXLM < 0.01) {
      return 'Standard fee';
    }
    return `Fee: $${(feeInXLM * 0.12).toFixed(2)}`; // Approximate USD conversion for display
  };

  const { amount, currency } = extractSorobanPaymentAmount(transaction);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white hover:border-primary/20 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-sm">{type}</p>
            <p className="text-xs text-gray-500">
              {dayjs(transaction.timestamp).format('MMM D, YYYY h:mm A')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            {Number(amount) > 0 ? `${parseFloat(amount).toFixed(7).replace(/\.?0+$/, '')} ${currency}` : "Processing..."}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} flex items-center gap-1`}>
            {status.icon}
            {status.text}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{dayjs(transaction.timestamp).fromNow()}</span>
        <div className="flex items-center gap-3">
          <span>Ref #{transaction.ledger.toLocaleString()}</span>
          <span>{formatFee(transaction.fee_charged)}</span>
        </div>
      </div>
    </div>
  );
};

export default function PageClient() {
  const { account, isLoadingAccount } = useWallet();
  const { wallets, setSelectedWalletId } = useWalletStore();
  const [, setIsTransferring] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<ITransactionDetails | null>(null)
  const [, setIsQuickActionsOpen] = useState(false)
  const [isWalletTransferModalOpen, setIsWalletTransferModalOpen] = useState(false)

  // tRPC procedures
  const trpcUtils = api.useUtils();
  const { data: activity, isLoading: isLoadingActivity } = api.activity.getActivity.useQuery({ items: 7 });
  const { data: txs, isLoading: isLoadingTx } = api.ledger.transactions.useQuery({
    walletId: String(account?.id)
  }, { enabled: !!account?.id })

  // Soroban transactions query
  const { data: sorobanTxs, isLoading: isLoadingSorobanTx } = api.soroban.getWalletTransactions.useQuery({
    walletId: String(account?.id),
    limit: 5
  }, { enabled: !!account?.id });

  const handleTransactionClick = (transaction: ITransactionDetails) => {
    // Toggle details if clicking the same transaction
    if (selectedTransaction?.id === transaction.id) {
      setSelectedTransaction(null)
    } else {
      setSelectedTransaction(transaction)
    }
  }

  return (
    <div className="animate-in fade-in duration-500 mb-10" >
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Primary Account Overview */}
          <div className="p-6 border border-gray-200 rounded-lg bg-white relative">
            {/* <button
              onClick={() => {
                const currentIndex = wallets.findIndex(w => w.id === account?.id);
                const nextIndex = (currentIndex + 1) % wallets.length;
                const nextWallet = wallets[nextIndex];
                if (nextWallet) {
                  setSelectedWalletId(nextWallet.id);
                }
              }}
              className="absolute top-4 right-4 inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors hover:border-gray-300"
            >
              Switch to {wallets[wallets.findIndex(w => w.id === account?.id) + 1]?.alias} →
            </button> */}
            <div className="flex items-center justify-between mb-6">
              <div
                key={account?.id}
                className="animate-slide-in"
              >
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">{account?.alias}</h2>
                </div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-semibold mt-1">
                    {fromStroops(account?.main_balance?.amount, 2)}
                  </p>
                  {isLoadingAccount && (
                    <LoadingSpinner className="h-4 w-4 ml-2 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats Overview */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Monthly Activity</h3>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold">47</p>
              <p className="text-xs text-green-600 mt-1">+0% from last month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Total Outgoing</h3>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold">${fromStroops(0, 2)}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Pending</h3>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold">${fromStroops(5000000, 2)}</p>
              <p className="text-xs text-gray-500 mt-1">0 transactions</p>
            </div>
          </div> */}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={<ArrowDownLeft className="h-4 w-4" />}
              label="Add Funds"
              href="/dashboard/deposits"
            />
            <QuickActionButton
              icon={<ArrowUpRight className="h-4 w-4" />}
              label="Send Money"
              href="/dashboard/payouts/new"
            />
            {wallets.length > 1 && (
              <QuickActionButton
                icon={<ArrowUpRight className="h-4 w-4" />}
                label="Transfer Between Wallets"
                onClick={() => setIsWalletTransferModalOpen(true)}
              />
            )}
            <QuickActionButton
              icon={<CreditCard className="h-4 w-4" />}
              label="Cards"
              href="/dashboard/cards"
            />
            {/* <QuickActionButton
              icon={<PieChart className="h-4 w-4" />}
              label="Analytics"
              href="/dashboard/analytics"
            /> */}
          </div>

          {/* Advanced Banking Services */}
          {sorobanTxs && sorobanTxs.length > 0 && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {sorobanTxs.length} recent
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Your latest transactions
                </p>
              </div>

              <div className="p-4">
                {isLoadingSorobanTx ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner className="h-6 w-6 text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading recent activity...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sorobanTxs.map((transaction: any) => (
                      <SorobanTransactionCard key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State for Advanced Banking Services */}
          {sorobanTxs && sorobanTxs.length === 0 && !isLoadingSorobanTx && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  No recent activity
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Advanced banking features will appear here when used
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Network Details & Activity */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Activity Timeline */}
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activity?.map((activity, i) => {
                if (activity.type === 'new_wallet') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-primary/60 before:bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <WalletBadge walletAlias={activity.raw.alias} onClick={() => setSelectedWalletId(activity.raw.id)} />
                          account created</p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                      <div className="absolute right-0 bottom-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        <p className="text-xs text-gray-400">{dayjs(activity.raw.created_at).format('MMM D, YYYY hh:mm')}</p>
                      </div>
                    </div>

                  )
                } else if (activity.type === 'transfer_out') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-primary/60 before:bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-xs font-medium text-gray-600">
                            {(activity.raw.source_amount / 100).toLocaleString('en-US', {
                              style: 'currency',
                              currency: activity.raw.source_currency === "USDC" ? "USD" : activity.raw.source_currency,
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="ml-1">payment sent </span>
                          {activity.raw.wallet && (
                            <span className="ml-1">from <WalletBadge walletAlias={activity.raw.wallet.alias} onClick={() => activity.raw.wallet?.id && setSelectedWalletId(activity.raw.wallet.id)} /></span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                      <div className="absolute right-0 bottom-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        <p className="text-xs text-gray-400">{dayjs(activity.raw.created_at).format('MMM D, YYYY hh:mm')}</p>
                      </div>
                    </div>
                  )
                } else if (activity.type === 'soroban_transaction') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-yellow-500/60 before:bg-yellow-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          Blockchain transaction
                          {activity.raw.source_wallet && (
                            <span className="ml-1">on <WalletBadge walletAlias={activity.raw.source_wallet.alias} onClick={() => activity.raw.source_wallet?.id && setSelectedWalletId(activity.raw.source_wallet.id)} /></span>
                          )}
                          <span className="ml-1 inline-flex items-center rounded-md bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                            {activity.raw.is_successful ? 'Completed' : 'Failed'}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                      <div className="absolute right-0 bottom-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        <p className="text-xs text-gray-400">{dayjs(activity.raw.created_at).format('MMM D, YYYY hh:mm')}</p>
                      </div>
                    </div>
                  )
                } else if (activity.type === 'invoice_received') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-primary/60 before:bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          Invoice received
                          <span className="ml-1 inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors hover:border-gray-300 transition-opacity duration-200 mr-1">
                            {activity.raw.invoice_number}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                    </div>
                  )
                }
                else if (activity.type === 'invoice_created') {
                  return (
                    <div key={i} className="flex items-start gap-3 group relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 relative before:absolute before:inset-0 before:rounded-full before:animate-pulse before:blur-sm
                        ${dayjs().diff(activity.raw.created_at, 'minute') < 5
                          ? 'bg-green-500/60 before:bg-green-500'
                          : 'bg-primary/60 before:bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          Invoice created
                          <span className="ml-1 inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors hover:border-gray-300 transition-opacity duration-200 mr-1">
                            {activity.raw.invoice_number}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{dayjs(activity.raw.created_at).fromNow()}</p>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide-over and transaction details remain unchanged */}

      {/* Wallet Transfer Modal */}
      <WalletTransferModal
        isOpen={isWalletTransferModalOpen}
        onClose={() => setIsWalletTransferModalOpen(false)}
      />
    </div >
  )
}
