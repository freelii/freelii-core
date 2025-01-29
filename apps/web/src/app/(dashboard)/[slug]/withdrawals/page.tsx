import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper } from "@freelii/ui"
import { type Metadata } from "next"
import { WithdrawalMethods } from "./withdrawal-methods"

export const metadata: Metadata = {
    title: "Withdrawals",
    description: "Overview of all withdrawals",
}

export default function WithdrawalsPage() {

    return (
        <PageContent title="Withdrawals" description="Overview of all withdrawals">
            <MaxWidthWrapper>
                <WithdrawalMethods />
            </MaxWidthWrapper>
        </PageContent>
    )
}
