import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper } from "@freelii/ui"
import { Metadata } from "next"
import PayoutsTable from "./page-payouts"

export const metadata: Metadata = {
  title: "Payouts",
  description: "Overview of all payouts",
}

export default function PayoutsPage() {

  return (
    <PageContent title="Account Payouts" description="Overview of all payouts">
      <MaxWidthWrapper>
        <PayoutsTable />
      </MaxWidthWrapper>
    </PageContent>
  )
}
