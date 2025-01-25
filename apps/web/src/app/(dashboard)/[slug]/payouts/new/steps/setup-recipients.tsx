import { useFixtures } from "@/fixtures/useFixtures"
import RecipientsTable from "./recipients-table"
import { Button } from "@freelii/ui"

export default function SetupRecipients() {
    return (
        <RecipientsTable mode="payout" />
    )
}