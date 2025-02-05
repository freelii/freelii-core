import { PrismaClient } from "@prisma/client";
import recipients from "../src/fixtures/recipients.json";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    // Create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
        where: { email: "toscano0210@gmail.com" },
        update: {},
        create: {
            email: "toscano0210@gmail.com",
            name: "Test User",
        },
    });

    console.log("Created test user:", testUser.email);

    // Process each recipient
    for (const recipient of recipients) {
        // Create or update the client
        const client = await prisma.client.upsert({
            where: {
                user_id_name: {
                    user_id: testUser.id,
                    name: recipient.name,
                }
            },
            update: {
                email: recipient.email,
                verification_status: recipient.isVerified ? "VERIFIED" : "PENDING",
                recipient_type: recipient.recipientType === "business" ? "BUSINESS" : "INDIVIDUAL",
            },
            create: {
                name: recipient.name,
                email: recipient.email,
                verification_status: recipient.isVerified ? "VERIFIED" : "PENDING",
                recipient_type: recipient.recipientType === "business" ? "BUSINESS" : "INDIVIDUAL",
                user_id: testUser.id,
            },
        });

        console.log("Processed client:", client.name);

        // If the recipient has banking details, create a FIAT account
        if (recipient.bankingDetails) {
            const { bankingDetails } = recipient;

            await prisma.fiatAccount.upsert({
                where: {
                    client_id_alias: {
                        client_id: client.id,
                        alias: `${bankingDetails.bankName} - ${bankingDetails.currency.shortName}`,
                    }
                },
                update: {
                    account_number: bankingDetails.accountNumber,
                    routing_number: bankingDetails.routingNumber,
                    bank_name: bankingDetails.bankName,
                    bank_address: bankingDetails.bankAddress,
                    bank_city: bankingDetails.bankCity,
                    bank_state: bankingDetails.bankState || "",
                    bank_zip: bankingDetails.bankZip || "",
                    iso_currency: bankingDetails.currency.shortName,
                },
                create: {
                    alias: `${bankingDetails.bankName} - ${bankingDetails.currency.shortName}`,
                    account_number: bankingDetails.accountNumber,
                    routing_number: bankingDetails.routingNumber,
                    bank_name: bankingDetails.bankName,
                    bank_address: bankingDetails.bankAddress,
                    bank_city: bankingDetails.bankCity,
                    bank_state: bankingDetails.bankState || "",
                    bank_zip: bankingDetails.bankZip || "",
                    iso_currency: bankingDetails.currency.shortName,
                    client_id: client.id,
                },
            });

            console.log("Created FIAT account for:", client.name);
        }
    }

    console.log("Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 