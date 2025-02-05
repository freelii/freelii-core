export function fromStroops(amount: bigint | number | string | null | undefined, decimals: number = 7): string {
    if (!amount) return '0';
    return (Number(amount) / 10_000_000).toFixed(decimals);
}

export function toStroops(amount: number): bigint {
    return BigInt(amount * 10_000_000);
}
