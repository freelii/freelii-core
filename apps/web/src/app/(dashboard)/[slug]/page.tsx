import { PageContent } from "@/ui/layout/page-content";
import { MaxWidthWrapper } from "@freelii/ui";
import PayoutsTable from "./payouts/page-payouts";

export default function WorkspacePage() {
  return (
    <PageContent title="Account Payouts" description="Overview of all payouts">
      <MaxWidthWrapper>
        <PayoutsTable />
      </MaxWidthWrapper>
    </PageContent>
  );
}
