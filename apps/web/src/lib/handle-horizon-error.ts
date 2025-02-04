import { Horizon } from "@stellar/stellar-sdk";
import { TRPCError } from "@trpc/server";
import { AxiosError } from "axios";

export function handleHorizonServerError(error: unknown) {
    console.log("horizon error", error);
    let message = "Failed to send transaction to blockchain";
    const axiosError = error as AxiosError<Horizon.HorizonApi.ErrorResponseData>;
    if (
        typeof (axiosError?.response as { detail?: string })?.detail === "string"
    ) {
        message = (axiosError?.response as { detail?: string })?.detail ?? message;
    } else if (axiosError?.response?.data) {
        switch (axiosError.response.data.title) {
            case "Rate Limit Exceeded":
                message = "Rate limit exceeded. Please try again in a few seconds";
                break;
            case "Internal Server Error":
                message = "We are facing some issues. Please try again later";
                break;
            case "Transaction Failed":
                message = "Transaction failed";
                const txError = parsedTransactionFailedError(axiosError.response.data);
                if (txError) {
                    message = `Transaction failed: ${txError}`;
                }
                break;
            default:
                message = "Failed to send transaction to blockchain";
                break;
        }
    }
    console.log(message);
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message,
    });
}
function parsedTransactionFailedError(
    failedTXError?: Horizon.HorizonApi.ErrorResponseData.TransactionFailed,
) {
    console.log("failedTXError", failedTXError);
    if (!failedTXError) return;
    const { extras } = failedTXError;
    let message = "Unknown error";
    if (!extras) {
        return message;
    }
    if (
        extras.result_codes.transaction ===
        Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH
    ) {
        message = "Invalid transaction signature";
    } else if (
        extras.result_codes.transaction ===
        Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE
    ) {
        message = "Transaction expired. Please try again";
    } else if (
        extras.result_codes.transaction ===
        Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT
    ) {
        message = "Source account does not exist";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_FAILED,
        )
    ) {
        message = "One of the operations failed (none were applied)";
    } else if (extras.result_codes.operations?.includes("op_no_issuer")) {
        message = "The issuer account does not exist. ¿Has network been restored?";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_EARLY,
        )
    ) {
        message = "The ledger closeTime was before the minTime";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE,
        )
    ) {
        message = "The ledger closeTime was after the maxTime";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_MISSING_OPERATION,
        )
    ) {
        message = "No operation was specified";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ,
        )
    ) {
        message = "The sequence number does not match source account";
    } else if (
        extras.result_codes.transaction ===
        Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ
    ) {
        message = "The sequence number does not match source account";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH,
        )
    ) {
        message =
            "Check if you have the required permissions and signatures for this Network";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_BALANCE,
        )
    ) {
        message = "You don't have enough balance to perform this operation";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT,
        )
    ) {
        message = "The source account does not exist";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH_EXTRA,
        )
    ) {
        message = "There are unused signatures attached to the transaction";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_FEE,
        )
    ) {
        message = "The fee is insufficient for the transaction";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_INTERNAL_ERROR,
        )
    ) {
        message = "An unknown error occurred while processing the transaction";
    } else if (
        extras.result_codes.operations?.includes(
            Horizon.HorizonApi.TransactionFailedResultCodes.TX_NOT_SUPPORTED,
        )
    ) {
        message = "The operation is not supported by the network";
    } else if (extras.result_codes.operations?.includes("op_buy_no_trust")) {
        message = "You need to establish trustline first";
    } else if (extras.result_codes.operations?.includes("op_low_reserve")) {
        message = "You don't have enough XLM to create the offer";
    } else if (extras.result_codes.operations?.includes("op_bad_auth")) {
        message =
            "There are missing valid signatures, or the transaction was submitted to the wrong network";
    } else if (extras.result_codes.operations?.includes("op_no_source_account")) {
        message = "There is no source account";
    } else if (extras.result_codes.operations?.includes("op_not_supported")) {
        message = "The operation is not supported by the network";
    } else if (
        extras.result_codes.operations?.includes("op_too_many_subentries")
    ) {
        message = "Max number of subentries (1000) already reached";
    }
    return message;
}