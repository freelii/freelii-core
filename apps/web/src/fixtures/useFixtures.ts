"use client";
import { type Payout, type Recipient } from "@/app/(dashboard)/[slug]/payouts/page-payouts";
import { CURRENCIES } from "@freelii/utils/constants";
import dayjs from "dayjs";
import { useCallback, useState } from "react";

export interface SubAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  createdAt: string; // ISO Date string format
  status: 'active' | 'inactive';
  type: 'operational' | 'budget' | 'savings';
}

export interface FiatAccount {
  id: string;
  currency: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch: string;
  swift_code: string;
}

export interface Transaction {
  id: string;
  type: 'received' | 'sent';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  currency: string;
  reference: string;
}


const getRandomPastDate = () => {
  const minHours = 6;
  const maxDays = 7;

  // Convert maxDays to hours for consistent calculation
  const maxHours = maxDays * 24;

  // Generate random hours between minHours and maxHours
  const randomHours = minHours + Math.floor(Math.random() * (maxHours - minHours));

  return dayjs().subtract(randomHours, 'hour').toDate();
}

export const useFixtures = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const [fiatAccounts] = useState<FiatAccount[]>(require('./fiat-accounts.json') as unknown as FiatAccount[])
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const [recipients] = useState<Map<number, Recipient>>(new Map((require('./recipients.json') as unknown as Recipient[]).map((recipient: Recipient) => [Number(recipient.id), recipient])))
  const [payouts, setPayouts] = useState<Payout[]>(() => {
    // Load initial payments from JSON and local storage
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const initialPayments = require('./payments.json') as unknown as Payout[];
    const storedPayments = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('demo_payments') ?? '[]') as Payout[]
      : [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return [...storedPayments, ...initialPayments];
  })
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const [subAccounts] = useState<SubAccount[]>(require('./accounts.json') as unknown as SubAccount[])
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const initialTransactions = require('./transactions.json') as unknown as Transaction[];
    const storedTransactions = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('demo_transactions') ?? '[]') as Transaction[]
      : [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return [...storedTransactions, ...initialTransactions];
  })


  const [usdcAccount, setUsdcAccount] = useState({
    id: 'acc_usdc_001',
    name: 'USDC Account',
    accountNumber: '1234567890',
    lastUpdated: dayjs().subtract(7, 'minutes').toISOString(),
    currency: CURRENCIES.USDC!,
    blockchain: 'stellar',
    network: 'testnet',
    address: 'GB7JQJQ7JQJQ7JQJQ7JQJQ7JQJQ7JQJQ7JQJQ7JQJQ7JQJQ7JQJQ',
    balance: 109001.99,
    status: 'active',
    createdAt: dayjs().subtract(1, 'month').toISOString(),
    fiatUSDAccount: {
      id: 'acc_us_001',
      currency: 'USD',
      bank_name: 'Chase Bank',
      account_number: '987654321',
      account_name: 'Maria Santos',
      routing_number: '021000021',
      swift_code: 'CHASUS33'
    }
  });

  const addDemoPayment = useCallback((amount: number, currency: string, recipientId: number) => {
    const recipient = recipients.get(recipientId);
    if (!recipient) {
      return;
    }
    const newPayout = {
      id: `payout_${Date.now()}`, // Use timestamp for unique IDs
      currency,
      amount,
      recipients: [{ id: recipientId }],
      nextPayment: dayjs().subtract(1, 'second').toDate(),
      label: `${currency} Payment to ${recipient.name}`,
      progress: "One time payment"
    }

    const updatedPayouts = [(newPayout as unknown as Payout), ...payouts];
    setPayouts(updatedPayouts);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const demoPayments = updatedPayouts.filter(p => p.id.startsWith('payout_'));
      localStorage.setItem('demo_payments', JSON.stringify(demoPayments));
    }

    // Transactions
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'sent',
      description: `${currency} Payment to ${recipient.name}`,
      amount,
      date: dayjs().toISOString(),
      status: 'completed',
      currency,
      reference: `PAY-${Date.now()}`
    }

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    // Save transactions to localStorage
    if (typeof window !== 'undefined') {
      const demoTransactions = updatedTransactions.filter(tx => tx.id.startsWith('tx_'));
      localStorage.setItem('demo_transactions', JSON.stringify(demoTransactions));
    }

    setUsdcAccount({
      ...usdcAccount,
      balance: usdcAccount.balance - amount
    })
  }, [usdcAccount, payouts, recipients, transactions])

  const getBalance = useCallback(async () => {
    setUsdcAccount({
      ...usdcAccount,
      lastUpdated: dayjs().toISOString()
    })
    await new Promise((resolve) => setTimeout(resolve, 400))
    return usdcAccount.balance;
  }, [usdcAccount]);

  const setBalance = useCallback((balance: number) => {
    setUsdcAccount({
      ...usdcAccount,
      balance,
      lastUpdated: dayjs().toISOString()
    })
  }, [usdcAccount]);

  const getPayouts = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200))


    function mapRecipients(payout: Payout): Payout {
      if (!payout.recipients) {
        return payout
      }

      const payoutRecipients: Recipient[] = []
      payout.recipients.forEach((r: Partial<Recipient>) => {
        if (r.id) {
          const recipient = recipients.get(r.id);
          if (recipient) {
            payoutRecipients.push(recipient)
          }
        }
      })

      const nextPayment = getRandomPastDate()
      return {
        ...payout,
        recipients: payoutRecipients,
        nextPayment
      }
    }

    return payouts.map(mapRecipients);

  }, [recipients, payouts])

  const getRecipients = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    function mapLocations(recipient: Recipient): Recipient {
      if (!recipient.locationId) {
        return recipient
      }

      if (!location) {
        return recipient
      }
      return {
        ...recipient,
        location: location
      }
    }
    return Array.from(recipients.values())
  }, [recipients])

  const getSinglePayout = useCallback(async (payoutId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return payouts.find((payout) => payout.id === payoutId)
  }, [payouts])




  return {
    recipients,
    subAccounts,
    usdcAccount,
    getPayouts,
    getRecipients,
    getSinglePayout,
    getBalance,
    setBalance,
    fiatAccounts,
    transactions,
    addDemoPayment
  }
}