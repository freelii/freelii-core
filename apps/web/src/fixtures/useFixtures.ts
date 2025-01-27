"use client";
import { Payout, Recipient } from "@/app/(dashboard)/[slug]/payouts/page-payouts";
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
  const [fiatAccounts, setFiatAccounts] = useState<FiatAccount[]>(require('./fiat-accounts.json'))
  const [recipients, setRecipients] = useState<Map<number, Recipient>>(new Map(require('./recipients.json').map((recipient: any) => [Number(recipient.id), recipient])))
  const [payouts, setPayouts] = useState<Payout[]>(require('./payments.json'))
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(require('./accounts.json'))
  const [transactions, setTransactions] = useState<Transaction[]>(require('./transactions.json'))


  const [usdcAccount, setUsdcAccount] = useState({
    id: 'acc_usdc_001',
    lastUpdated: dayjs().subtract(7, 'minutes').toISOString(),
    currency: 'USDC',
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
    await new Promise((resolve) => setTimeout(resolve, 400))


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

  }, [recipients])

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
    transactions
  }
}