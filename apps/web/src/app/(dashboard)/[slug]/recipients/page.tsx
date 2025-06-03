import { PageContent } from "@/ui/layout/page-content";
import { Button, MaxWidthWrapper } from "@freelii/ui";
import { BanknoteIcon, UserPlus2 } from "lucide-react";
import Link from "next/link";
import RecipientsTable from "../payouts/new/steps/recipients-table";

export default function RecipientsPage() {
  return (
    <PageContent title="Recipients" titleControls={
      <div className="flex items-center gap-2">
        <Link href="/dashboard/payouts/new">
          <Button>
            <BanknoteIcon className="mr-2 h-4 w-4" />
            New Payout
          </Button>
        </Link>      <Link href="./recipients/new">
          <Button>
            <UserPlus2 className="mr-2 h-4 w-4" />
            Register Recipient
          </Button>
        </Link>
      </div>
    }>
      <MaxWidthWrapper>
        <RecipientsTable />
      </MaxWidthWrapper>
    </PageContent>
  )
}   