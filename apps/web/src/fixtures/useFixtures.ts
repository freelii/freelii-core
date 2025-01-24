"use client";
import { Recipient, Payment, Currency } from "@/app/(dashboard)/[slug]/payouts/page-payouts";
import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react"

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
  const [payments, setPayments] = useState<Payment[]>(require('./payments.json'))
  
  const getPayouts = useCallback(async (recipientId?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    
    function mapRecipients(payment: Payment): Payment {
      if(!payment.recipientId) {
        return payment
      }
      const recipient = recipients.get(payment.recipientId);
      if(!recipient) {
        return payment
      }
      const nextPayment = getRandomFutureDate()
      return {
        ...payment,
        recipient,
        nextPayment
      }
    }


    if (!recipientId) {
      return payments.map(mapRecipients);
    }
        return payments.filter((payment: any) => payment.recipientId === recipientId).map(mapRecipients)
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
    getRecipients
  }
}