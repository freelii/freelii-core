export function fromStroops(amount: bigint | number | string | null | undefined, decimals: number = 2): string {
    if (!amount) return '0.00';
    if (typeof amount === 'bigint') {
        return Number(amount / BigInt(10_000_000)).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
    }
    return (Math.floor((Number(amount) / 10_000_000) * 100) / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

export function toStroops(amount: number | string | bigint | null | undefined): bigint {
    let amountNumber = amount;
    if (!amount) return BigInt(0);
    if (typeof amount === 'string') {
        amountNumber = Number(amount);
    }
    if (typeof amountNumber === 'number') {
        return BigInt(parseInt((amountNumber * 100 * 10_000_000).toString(), 10) / 100);
    }
    if (typeof amountNumber === 'bigint') {
        return amountNumber;
    }
    return BigInt(0);
}