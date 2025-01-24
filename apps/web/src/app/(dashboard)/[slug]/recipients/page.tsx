import { PageContent } from "@/ui/layout/page-content";
import { MaxWidthWrapper } from "@freelii/ui";
import RecipientsTable from "../payouts/new/steps/recipients-table";

export default function RecipientsPage() {
  return (
    <PageContent title="Recipients" description="View and manage trusted recipients">
      <MaxWidthWrapper>
        <RecipientsTable />
      </MaxWidthWrapper>
    </PageContent>
  )
}   