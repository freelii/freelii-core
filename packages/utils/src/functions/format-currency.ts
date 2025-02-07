/**
 * Expected input currency is an Integer
 * i.e. 10000 is equivalent to 100.00 USD
 * @param amount 
 * @param inputCurrency 
 * @returns 
 */
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

    return formatter.format(amount / 100);
}

export const fromFormattedToNumber = (value: string | number) => {
    if (typeof value === 'string') {
        return Number(value.replace(/,/g, '').replace('$', ''));
    }
    return value;
}