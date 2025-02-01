export function formatCurrency(amount: number, inputCurrency: string): string {
    let currency = inputCurrency
    if (inputCurrency === "USDC") {
        currency = "USD"
    }
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(amount);
} 