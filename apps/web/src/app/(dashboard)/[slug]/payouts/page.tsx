import { Metadata } from "next"
import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper } from "@freelii/ui"
import PayoutsTable, { Payment } from "./page-payouts"
import dayjs from "dayjs"

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
}


const payments: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Dolores H.",
    label: 'Payment',
    progress: 'One time payment',
    recipient_email: 'dolores@example.com',
  },
  {
    id: "3u1reuv4",
    amount: 242,
    currency: 'PHP',
    nextPayment: dayjs().add(5, 'hour').toDate(),
    recipient: "Crisanto Reyes",
    label: 'Salary',
    progress: 'Monthly payment', 
    recipient_email: 'crisanto@example.com',
  },
  {
    id: "derv1ws0",
    amount: 837,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'week').toDate(),
    recipient: "Maria Santos",
    label: 'Salary',
    progress: 'Monthly payment',
    recipient_email: 'maria@example.com',
  },
  {
    id: "5kma53ae",
    amount: 874,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Insurance Company",
    label: 'Insurance',
    progress: '4 out of 6',
    recipient_email: 'insurance@example.com',
  },
  {
    id: "bhqecj4p",
    amount: 721,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Company Name",
    label: 'Inventory restocking',
    progress: 'One time payment',
    recipient_email: 'company@example.com',
  },
  {
    id: "adedev",
    amount: 500,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Engineering Company",
    label: 'Contract payment',
    progress: 'Every 2 weeks',
    recipient_email: 'engineering@example.com',
  },
  {
    id: "434343",
    amount: 1500,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Industrial Company",
    label: 'Contract payment',
    progress: 'Every 2 weeks',
    recipient_email: 'industrial@example.com',
  },
  {
    id: "434343",
    amount: 1500,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Industrial Company",
    label: 'Contract payment',
    progress: 'Every 2 weeks',
    recipient_email: 'industrial@example.com',
  },
  {
    id: "m5gr84i9",
    amount: 316,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Dolores H.",
    label: 'Payment',
    progress: 'One time payment',
    recipient_email: 'dolores@example.com',
  },
  {
    id: "3u1reuv4",
    amount: 242,
    currency: 'PHP',
    nextPayment: dayjs().add(5, 'hour').toDate(),
    recipient: "Crisanto Reyes",
    label: 'Salary',
    progress: 'Monthly payment', 
    recipient_email: 'crisanto@example.com',
  },
  {
    id: "derv1ws0",
    amount: 837,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'week').toDate(),
    recipient: "Maria Santos",
    label: 'Salary',
    progress: 'Monthly payment',
    recipient_email: 'maria@example.com',
  },
  {
    id: "5kma53ae",
    amount: 874,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Insurance Company",
    label: 'Insurance',
    progress: '4 out of 6',
    recipient_email: 'insurance@example.com',
  },
  {
    id: "bhqecj4p",
    amount: 721,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Company Name",
    label: 'Inventory restocking',
    progress: 'One time payment',
    recipient_email: 'company@example.com',
  },
  {
    id: "adedev",
    amount: 500,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Engineering Company",
    label: 'Contract payment',
    progress: 'Every 2 weeks',
    recipient_email: 'engineering@example.com',
  },
  {
    id: "434343",
    amount: 1500,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Industrial Company",
    label: 'Contract payment',
    progress: 'Every 2 weeks',
    recipient_email: 'industrial@example.com',
  },
  {
    id: "434343",
    amount: 1500,
    currency: 'PHP',
    nextPayment: dayjs().add(1, 'day').toDate(),
    recipient: "Industrial Company",
    label: 'Contract payment',
    progress: 'Every 2 weeks',
    recipient_email: 'industrial@example.com',
  },
].map((payment, index) => ({
  ...payment,
  id: `payment-${index}`,
}))

// Simulate a database read for tasks.
async function getTasks() {
  const data = await new Promise<Payment[]>((resolve) => {
    setTimeout(() => {
      resolve(payments)
    }, 1000)
  })

  return data;
}

export default async function TaskPage() {
  const tasks = await getTasks()

  return (
    <PageContent title="Schedule payments" description="Manage your upcoming payments and disbursements">
      <MaxWidthWrapper>
        <PayoutsTable payments={payments} />
      </MaxWidthWrapper>
    </PageContent>
  )
}
