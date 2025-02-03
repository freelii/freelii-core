export function fromStroops(amount: number | string | null, decimals: number = 7): string {
    if (!amount) return '0';
    return (Number(amount) / 10_000_000).toFixed(decimals);
}

export function toStroops(amount: number) {
    return amount * 10_000_000;
}
