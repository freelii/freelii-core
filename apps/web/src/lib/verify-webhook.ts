import { createHmac } from "crypto";

interface VerifyWebhookSignatureParams {
    payload: string;
    signature: string;
    secret: string;
}

export function verifyWebhookSignature({
    payload,
    signature,
    secret,
}: VerifyWebhookSignatureParams): boolean {
    const hmac = createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    return signature === digest;
} 