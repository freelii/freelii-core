import { PageContent } from "@/ui/layout/page-content";
import { Button, MaxWidthWrapper } from "@freelii/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import RecipientsTable from "../payouts/new/steps/recipients-table";

export default function RecipientsPage() {
  return (
    <PageContent title="Recipients" titleControls={
      <Link href="./recipients/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Recipient
        </Button></Link>
    }>
      <MaxWidthWrapper>
        <RecipientsTable />
      </MaxWidthWrapper>
    </PageContent>
  )
}   