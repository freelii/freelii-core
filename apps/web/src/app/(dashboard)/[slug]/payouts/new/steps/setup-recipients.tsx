import RecipientsTable from "./recipients-table"

interface SetupRecipientsProps {
    onNext: () => void
    onBack: () => void
}

export default function SetupRecipients({ onNext, onBack }: SetupRecipientsProps) {
    return (
        <RecipientsTable mode="payout" onNext={onNext} onBack={onBack} />
    )
}