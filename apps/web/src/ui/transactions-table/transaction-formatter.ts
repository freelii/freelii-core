import { TransactionMovementType, Transactions, TransactionStatus, TransactionType } from "@prisma/client";
import dayjs from "dayjs";
import { ITransactionDetails } from "./transaction-details";


export const formatTransaction = (transaction: Transactions): ITransactionDetails => {
    const description = transaction.tx_type === TransactionType.ON_CHAIN_TRANSFER ? "On-chain transfer" : "Internal transfer";
    return {
        id: transaction.id,
        type: transaction.movement_type === TransactionMovementType.IN ? "received" : "sent",
        description: description,
        amount: Number(transaction.amount),
        date: dayjs(transaction.created_at).format("DD/MM/YYYY HH:mm"),
        status: transaction.status === TransactionStatus.COMPLETED ? "completed" : transaction.status === TransactionStatus.FAILED ? "failed" : "pending",
        currency: transaction.currency,
        reference: "", // transaction.reference,
        sender: "", // transaction.sender?.name,
        senderEmail: "", // transaction.sender?.email,
        bankName: "", // transaction.recipient?.bank_name,
        accountNumber: "", // transaction.recipient?.account_number,
        failureReason: "", // transaction.failure_reason,
    }
}