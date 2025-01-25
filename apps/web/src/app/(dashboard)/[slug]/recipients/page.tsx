import { PageContent } from "@/ui/layout/page-content";
import { MaxWidthWrapper } from "@freelii/ui";
import RecipientsTable from "../payouts/new/steps/recipients-table";

export default function RecipientsPage() {
  return (
    <PageContent title="Recipients" >
      <MaxWidthWrapper>
        <RecipientsTable />
      </MaxWidthWrapper>
    </PageContent>
  )
}   