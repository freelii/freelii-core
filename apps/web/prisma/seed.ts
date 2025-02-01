import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create a user
    const user = await prisma.user.create({
        data: {
            id: 1,
        }
    })

    // Create some clients
    const clients = await Promise.all([
        prisma.client.create({
            data: {
                name: 'Acme Corporation',
                email: 'billing@acme.com',
                address: '123 Business Ave, Suite 100, New York, NY 10001',
                taxNumber: 'US123456789',
                userId: user.id,
            }
        }),
        prisma.client.create({
            data: {
                name: 'TechStart Inc',
                email: 'accounts@techstart.io',
                address: '456 Innovation Drive, San Francisco, CA 94105',
                taxNumber: 'US987654321',
                userId: user.id,
            }
        }),
        prisma.client.create({
            data: {
                name: 'Global Solutions Ltd',
                email: 'finance@globalsolutions.co',
                address: '789 Enterprise Road, London, UK SW1A 1AA',
                taxNumber: 'GB123456789',
                userId: user.id,
            }
        }),
    ])

    // Create invoices with line items
    const invoices = await Promise.all(
        clients.map(async (client, index) => {
            return prisma.invoice.create({
                data: {
                    invoiceNumber: `INV-2024-${(index + 1).toString().padStart(3, '0')}`,
                    poNumber: index === 1 ? 'PO-2024-001' : undefined,
                    currency: 'USD',
                    subtotal: 0, // Will be updated after line items are created
                    taxRate: 10,
                    totalAmount: 0, // Will be updated after line items are created
                    status: ['Paid', 'Pending', 'Overdue'][index],
                    dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
                    description: 'Professional Services',
                    generatorId: user.id,
                    clientId: client.id,
                    lineItems: {
                        create: [
                            {
                                description: 'Software Development Services',
                                quantity: 80,
                                unitPrice: 150,
                                amount: 12000,
                            },
                            {
                                description: 'UI/UX Design',
                                quantity: 40,
                                unitPrice: 120,
                                amount: 4800,
                            },
                            {
                                description: 'Project Management',
                                quantity: 20,
                                unitPrice: 100,
                                amount: 2000,
                            },
                        ],
                    },
                },
            })
        })
    )

    // Update invoice totals
    await Promise.all(
        invoices.map(async (invoice) => {
            const lineItems = await prisma.lineItem.findMany({
                where: { invoiceId: invoice.id },
            })

            const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
            const taxAmount = subtotal * (invoice.taxRate / 100)
            const totalAmount = subtotal + taxAmount

            await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    subtotal,
                    taxAmount,
                    totalAmount,
                },
            })
        })
    )
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 