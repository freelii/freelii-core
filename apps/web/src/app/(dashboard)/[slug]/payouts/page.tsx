import { Metadata } from "next"
import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper } from "@freelii/ui"
import PayoutsTable, { Payment } from "./page-payouts"
import dayjs from "dayjs"
import { useFixtures } from "@/fixtures/useFixtures"

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
}

export default function TaskPage() {

  return (
    <PageContent title="Payouts" description="Manage your upcoming payments and disbursements">
      <MaxWidthWrapper>
        <PayoutsTable />
      </MaxWidthWrapper>
    </PageContent>
  )
}
