import { useFixtures } from "@/fixtures/useFixtures"
import RecipientsTable from "./recipients-table"

export default function SetupRecipients() {
    return (
        <RecipientsTable mode="payout" />
    )
}