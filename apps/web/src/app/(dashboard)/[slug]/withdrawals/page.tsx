"use client"

import { PageContent } from "@/ui/layout/page-content"
import { MaxWidthWrapper } from "@freelii/ui"
import { WithdrawalMethods } from "./withdrawal-methods"

export default function WithdrawalsPage() {

    return (
        <PageContent title="Withdrawals" description="Overview of all withdrawals">
            <MaxWidthWrapper>
                <WithdrawalMethods />
            </MaxWidthWrapper>
        </PageContent>
    )
}
