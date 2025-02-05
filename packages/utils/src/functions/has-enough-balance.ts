export function hasEnoughBalance(balance: number | bigint, amount: number | bigint) {
    return BigInt(balance) >= BigInt(amount);
}