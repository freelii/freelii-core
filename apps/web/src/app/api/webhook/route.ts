import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        console.log('Hi!!')
        const body = await req.json() as object;
        console.log(body)
        return NextResponse.json(
            { message: "Webhook received" },
            { status: 200 }
        );
        /*
        const signature = req.headers.get("x-webhook-signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing webhook signature" },
                { status: 401 }
            );
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature({
            payload: JSON.stringify(body),
            signature,
            secret: env.WEBHOOK_SECRET,
        });

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid webhook signature" },
                { status: 401 }
            );
        }

        // Process webhook event
        const event = body.event;
        switch (event) {
            case "payment.created":
                // Handle payment created
                break;
            case "payment.updated":
                // Handle payment updated
                break;
            case "payment.failed":
                // Handle payment failed
                break;
            default:
                return NextResponse.json(
                    { error: "Unhandled webhook event" },
                    { status: 400 }
                );
        }

        return NextResponse.json({ received: true });
        */
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 