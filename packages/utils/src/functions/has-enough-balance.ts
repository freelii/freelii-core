export function hasEnoughBalance(balance: number | bigint | undefined, amount: number | bigint | undefined) {
    console.log("balance", balance, "amount", amount)
    if (!balance || !amount) return false;

    return BigInt(balance) >= BigInt(amount);
}