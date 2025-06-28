"use client"

import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { useWallet } from "@/wallet/useWallet"
import { Button, LoadingSpinner, MaxWidthWrapper, Tabs, TabsContent, TabsList, TabsTrigger, useCopyToClipboard } from "@freelii/ui"
import { shortAddress } from "@freelii/utils/functions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CheckCircle, ChevronDown, Copy, XCircle, Zap } from "lucide-react"
import { useState } from "react"

dayjs.extend(relativeTime)

const SorobanTransactionCard = ({ transaction }: { transaction: any }) => {
  const getTransactionType = () => {
    // Check operations for contract calls that indicate transaction type
    const operation = transaction.operations?.[0];
    if (operation?.function_name) {
      switch (operation.function_name) {
        case 'transfer':
          return { type: 'Money Transfer', icon: <ArrowRight className="h-4 w-4" />, color: 'text-blue-600' };
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
    return { type: 'Blockchain Deposit', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-green-600' };
  };

  const { type, icon, color } = getTransactionType();

  const getStatusDisplay = () => {
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
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} flex items-center gap-1`}>
          {status.icon}
          {status.text}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{dayjs(transaction.timestamp).fromNow()}</span>
        <div className="flex items-center gap-3">
          <span>Ref #{transaction.ledger?.toLocaleString()}</span>
          <span>{formatFee(transaction.fee_charged || 0)}</span>
        </div>
      </div>
    </div>
  );
};

function AccountDetails() {
  const [, copyToClipboard] = useCopyToClipboard()
  const { account } = useWallet();
  const [activeSection, setActiveSection] = useState<'wire' | 'ach' | 'blockchain' | null>(null)

  // Fetch Soroban transactions for the current wallet
  const { data: sorobanTransactions, isLoading: isLoadingSoroban } = api.soroban.getWalletTransactions.useQuery(
    {
      walletId: account?.id || '',
      limit: 10
    },
    {
      enabled: !!account?.id
    }
  );

  const renderLatestDeposits = () => {
    if (isLoadingSoroban) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-gray-500">Loading your recent deposits...</p>
        </div>
      );
    }

    if (!sorobanTransactions || sorobanTransactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <svg
              className="size-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900">No deposits yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            When you receive money, your deposits will show up here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sorobanTransactions.map((transaction) => (
          <SorobanTransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full relative space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
        {/* Left side - Recipient Details */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receive Money to Your Account</h3>

            {/* Wire Transfer Section */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveSection(activeSection === 'wire' ? null : 'wire')}
                className="flex w-full justify-between items-center text-sm font-medium py-3 hover:bg-gray-50 px-2 rounded-md transition-colors"
              >
                <span>Wire Transfers (Domestic & International)</span>
                <ChevronDown className={`size-4 transition-transform ${activeSection === 'wire' ? 'rotate-180' : ''}`} />
              </button>

              {activeSection === 'wire' && (
                <div className="mt-4 px-2">
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900">Wire Transfer Account Coming Soon</h4>
                      <p className="text-xs text-gray-600 max-w-xs">
                        We're finalizing regulatory approvals to provide dedicated wire transfer accounts.
                      </p>
                    </div>
                    <Button
                      className="text-xs px-4 py-2"
                      onClick={() => {
                        // Add your request logic here
                        console.log('Request wire transfer account');
                      }}
                    >
                      Request Wire Transfer Account
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ACH Section */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveSection(activeSection === 'ach' ? null : 'ach')}
                className="flex w-full justify-between items-center text-sm font-medium py-3 hover:bg-gray-50 px-2 rounded-md transition-colors"
              >
                <span>ACH Deposits</span>
                <ChevronDown className={`size-4 transition-transform ${activeSection === 'ach' ? 'rotate-180' : ''}`} />
              </button>

              {activeSection === 'ach' && (
                <div className="mt-4 px-2">
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900">ACH Account Coming Soon</h4>
                      <p className="text-xs text-gray-600 max-w-xs">
                        ACH deposit accounts will be available once our banking partnerships are finalized.
                      </p>
                    </div>
                    <Button
                      className="text-xs px-4 py-2"
                      onClick={() => {
                        // Add your request logic here
                        console.log('Request ACH account');
                      }}
                    >
                      Request Your ACH Account
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Blockchain Section */}
            <div className="pb-4">
              <button
                onClick={() => setActiveSection(activeSection === 'blockchain' ? null : 'blockchain')}
                className="flex w-full justify-between items-center text-sm font-medium py-3 hover:bg-gray-50 px-2 rounded-md transition-colors"
              >
                <span>Blockchain Deposits</span>
                <ChevronDown className={`size-4 transition-transform ${activeSection === 'blockchain' ? 'rotate-180' : ''}`} />
              </button>

              {activeSection === 'blockchain' && (
                <div className="mt-4 px-2 space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Network</span>
                    <span className="font-medium">{account?.network}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Address</span>
                    <span className="font-medium flex items-center gap-2">
                      {shortAddress(account?.address, 6)}
                      <Button onClick={() => copyToClipboard(account?.address ?? '', false)} variant="ghost" className="text-xs text-gray-500">
                        <Copy className="size-3" />
                      </Button>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Tabs defaultValue="latest" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="latest">Latest Deposits</TabsTrigger>
              <TabsTrigger value="request">Upcoming Deposits</TabsTrigger>
            </TabsList>

            <TabsContent value="latest">
              {renderLatestDeposits()}
            </TabsContent>

            <TabsContent value="request">
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <svg
                    className="size-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No pending deposits</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upcoming deposits will appear here once they&apos;re initiated.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function DepositsPage() {
  return (
    <PageContent title="Account Deposits">
      <MaxWidthWrapper>
        <AccountDetails />
      </MaxWidthWrapper>
    </PageContent>
  )
}
