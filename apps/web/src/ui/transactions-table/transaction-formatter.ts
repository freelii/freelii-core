import {
    type Client,
    TransactionMovementType,
    type Transactions,
    TransactionStatus,
    TransactionType,
    type User
} from "@prisma/client";
import dayjs from "dayjs";
import { type ITransactionDetails } from "./transaction-details";


export const formatTransaction = (transaction: Transactions & { recipient?: Client | null, sender?: User | null }): ITransactionDetails => {

    return {
        id: transaction.id,
        type: transaction.movement_type === TransactionMovementType.IN ? "received" : "sent",
        description: getDescription(transaction),
        amount: Number(transaction.amount),
        date: dayjs(transaction.created_at).format("YYYY-MM-DD HH:mm"),
        status: transaction.status === TransactionStatus.COMPLETED ? "completed" : transaction.status === TransactionStatus.FAILED ? "failed" : "pending",
        currency: transaction.currency,
        reference: transaction.reference ?? "",
        sender: "", // transaction.sender?.name,
        senderEmail: "", // transaction.sender?.email,
        bankName: "", // transaction.recipient?.bank_name,
        accountNumber: "", // transaction.recipient?.account_number,
        failureReason: "", // transaction.failure_reason,
    }
}

function getDescription(transaction: Transactions & { recipient?: Client | null, sender?: User | null }) {
    if (transaction.tx_type === TransactionType.ON_CHAIN_TRANSFER) {

        if (transaction.recipient?.name) {
            return `${transaction.recipient.name}`;
        }
    }
    return "Payment";
}
