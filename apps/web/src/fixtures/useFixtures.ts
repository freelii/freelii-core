"use client";
import { Recipient, Payout, Currency } from "@/app/(dashboard)/[slug]/payouts/page-payouts";
import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react"

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

const getRandomFutureDate = () => {
  const minHours = 6;
  const maxDays = 7;
  
  // Convert maxDays to hours for consistent calculation
  const maxHours = maxDays * 24;
  
  // Generate random hours between minHours and maxHours
  const randomHours = minHours + Math.floor(Math.random() * (maxHours - minHours));
  
  return dayjs().add(randomHours, 'hour').toDate();
}

export const useFixtures = () => {
  const [recipients, setRecipients] = useState<Map<number, Recipient>>(new Map(require('./recipients.json').map((recipient: any) => [Number(recipient.id), recipient])))
  const [payouts, setPayouts] = useState<Payout[]>(require('./payments.json'))
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(require('./accounts.json'))
  
  const getPayouts = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    
    function mapRecipients(payout: Payout): Payout {
      if(!payout.recipients) {
        return payout
      }

      const payoutRecipients: Recipient[] = []
      payout.recipients.forEach((r: Partial<Recipient>)=> {
        if(r.id) {
          const recipient = recipients.get(r.id);
          if(recipient) {
            payoutRecipients.push(recipient)
          }
        }
      })

      const nextPayment = getRandomFutureDate()
      return {
        ...payout,
        recipients: payoutRecipients,
        nextPayment
      }
    }

    return payouts.map(mapRecipients);
    
  },[recipients])

    const getRecipients = useCallback(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400))

      function mapLocations(recipient: Recipient): Recipient {
        if(!recipient.locationId) {
          return recipient
        }
        
        if(!location) {
          return recipient
        }
        return {
          ...recipient,
          location: location
        }
      }
        return Array.from(recipients.values())
    }, [recipients])




  return {
    recipients,
    getPayouts,
    getRecipients,
    subAccounts
  }
}